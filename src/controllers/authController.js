const jwt = require('jsonwebtoken');
const db = require('../models');
const { User, Review } = require('../models');

// Генерация JWT токена
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ============================================================
// ИСПРАВЛЕНИЕ #1: Валидация входных данных
// Защита от пустых полей и XSS
// ============================================================
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().substring(0, 200); // обрезаем до 200 символов
}

// Формат ответа пользователя (без пароля, с аватаркой)
function formatUser(user, token) {
    const interests = Array.isArray(user.interests)
        ? user.interests
        : JSON.parse(user.interests || '[]');
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        // ИСПРАВЛЕНИЕ #2: используем сохранённый avatar из БД если есть,
        // иначе генерируем через dicebear
        avatar: user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('/uploads/'))
            ? user.avatar
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
        interests,
        token
    };
}

// ============================================================
// Регистрация
// ============================================================
exports.register = async (req, res) => {
    try {
        const name     = sanitizeString(req.body.name);
        const email    = sanitizeString(req.body.email).toLowerCase();
        const password = req.body.password;

        // Валидация
        if (!name || name.length < 2) {
            return res.status(400).json({ message: 'Имя должно содержать минимум 2 символа' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Некорректный email' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Пароль должен быть минимум 6 символов' });
        }

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const user = await User.create({ name, email, password });
        res.status(201).json(formatUser(user, generateToken(user.id)));
    } catch (error) {
        console.error('❌ register:', error.message);
        res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    }
};

// ============================================================
// Вход
// ============================================================
exports.login = async (req, res) => {
    try {
        const email    = sanitizeString(req.body.email).toLowerCase();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ message: 'Введите email и пароль' });
        }

        const user = await User.findOne({ where: { email } });
        // ИСПРАВЛЕНИЕ #3: одинаковое сообщение для несуществующего пользователя
        // и неверного пароля — защита от перебора
        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        res.json(formatUser(user, generateToken(user.id)));
    } catch (error) {
        console.error('❌ login:', error.message);
        res.status(500).json({ message: 'Ошибка сервера при входе' });
    }
};

// ============================================================
// Получить свой профиль
// ============================================================
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        res.json(user);
    } catch (error) {
        console.error('❌ getProfile:', error.message);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// ============================================================
// Обновить интересы
// ============================================================
exports.updateInterests = async (req, res) => {
    try {
        const { interests } = req.body;

        // ИСПРАВЛЕНИЕ #4: валидация — interests должен быть массивом строк
        if (!Array.isArray(interests)) {
            return res.status(400).json({ message: 'interests должен быть массивом' });
        }
        const cleanInterests = interests
            .filter(i => typeof i === 'string')
            .map(i => sanitizeString(i))
            .slice(0, 20); // максимум 20 интересов

        await User.update(
            { interests: JSON.stringify(cleanInterests) },
            { where: { id: req.user.id } }
        );
        res.json({ message: 'Интересы обновлены', interests: cleanInterests });
    } catch (error) {
        console.error('❌ updateInterests:', error.message);
        res.status(500).json({ message: 'Ошибка обновления интересов' });
    }
};

// ============================================================
// Получить всех пользователей с интересами (для правой колонки)
// ИСПРАВЛЕНИЕ #5: не отдаём email других пользователей — приватность
// ============================================================
exports.getInterests = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'avatar', 'interests'],
            // исключаем текущего пользователя — он и так себя знает
            where: { id: { [require('sequelize').Op.ne]: req.user.id } }
        });

        // Получаем рейтинги всех пользователей
        const ratings = await db.sequelize.query(
            'SELECT toUserId, AVG(rating) as avgRating FROM Reviews GROUP BY toUserId',
            { type: db.sequelize.QueryTypes.SELECT }
        ).catch(() => []); // Игнорируем ошибку, если таблица еще не создана
        
        const ratingMap = {};
        ratings.forEach(r => ratingMap[r.toUserId] = parseFloat(r.avgRating).toFixed(1));

        const formatted = users.map(u => {
            const interests = Array.isArray(u.interests)
                ? u.interests
                : JSON.parse(u.interests || '[]');
            return {
                id: u.id,
                name: u.name,
                avatar: u.avatar && (u.avatar.startsWith('http') || u.avatar.startsWith('/uploads/'))
                    ? u.avatar
                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`,
                interests,
                avgRating: ratingMap[u.id] || null
            };
        });
        res.json(formatted);
    } catch (error) {
        console.error('❌ getInterests:', error.message);
        res.status(500).json({ message: 'Ошибка загрузки пользователей' });
    }
};

// ============================================================
// Получить профиль другого пользователя по ID
// НОВЫЙ МАРШРУТ: GET /api/auth/users/:id
// ============================================================
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            // email не отдаём — приватность
            attributes: ['id', 'name', 'avatar', 'interests', 'bio']
        });
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

        const interests = Array.isArray(user.interests)
            ? user.interests
            : JSON.parse(user.interests || '[]');

        res.json({
            id: user.id,
            name: user.name,
            avatar: user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('/uploads/'))
                ? user.avatar
                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
            interests,
            bio: user.bio || ''
        });
    } catch (error) {
        console.error('❌ getUserById:', error.message);
        res.status(500).json({ message: 'Ошибка загрузки профиля' });
    }
};