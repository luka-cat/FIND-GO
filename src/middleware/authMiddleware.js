const jwt = require('jsonwebtoken');
const { User } = require('../models');

// ============================================================
// ИСПРАВЛЕНИЕ #1: Кэш пользователей в памяти
// Каждый запрос с токеном делал запрос в БД — при 100 rps это
// 100 лишних SQL запросов в секунду. Кэшируем на 5 минут.
// ============================================================
const userCache = new Map(); // token_id → { user, expires }
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

function getCachedUser(userId) {
    const cached = userCache.get(userId);
    if (!cached) return null;
    if (Date.now() > cached.expires) {
        userCache.delete(userId);
        return null;
    }
    return cached.user;
}

function setCachedUser(userId, user) {
    userCache.set(userId, { user, expires: Date.now() + CACHE_TTL });
    // Ограничиваем размер кэша — не более 1000 записей
    if (userCache.size > 1000) {
        const firstKey = userCache.keys().next().value;
        userCache.delete(firstKey);
    }
}

// Очищаем кэш конкретного пользователя при смене данных
// (вызывать при обновлении профиля)
function invalidateUserCache(userId) {
    userCache.delete(userId);
}

module.exports = async (req, res, next) => {
    try {
        // ИСПРАВЛЕНИЕ #2: Проверяем наличие заголовка Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Не авторизован: нет токена' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Не авторизован: пустой токен' });
        }

        // ИСПРАВЛЕНИЕ #3: Явная проверка JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error('❌ JWT_SECRET не задан в .env!');
            return res.status(500).json({ message: 'Ошибка конфигурации сервера' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            // Различаем истёкший токен от невалидного
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Сессия истекла, войдите снова' });
            }
            return res.status(401).json({ message: 'Неверный токен' });
        }

        // Проверяем кэш перед запросом в БД
        let user = getCachedUser(decoded.id);
        if (!user) {
            user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });
            if (!user) {
                return res.status(401).json({ message: 'Пользователь не найден' });
            }
            setCachedUser(decoded.id, user);
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('❌ authMiddleware:', error.message);
        return res.status(401).json({ message: 'Ошибка авторизации' });
    }
};

// Экспортируем функцию сброса кэша для использования в других контроллерах
module.exports.invalidateUserCache = invalidateUserCache;