const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User } = require('../models');

// Убеждаемся, что папка существует
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================================
// Multer — загрузка аватаров
// ============================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        // ИСПРАВЛЕНИЕ: безопасное имя файла (только расширение от оригинала)
        const ext = path.extname(file.originalname).toLowerCase();
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        if (!allowed.includes(ext)) {
            return cb(new Error('Недопустимый тип файла'));
        }
        cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Разрешены только изображения'));
        }
        cb(null, true);
    }
});

// ============================================================
// POST /api/avatar — загрузка аватара
// ============================================================
exports.uploadAvatar = async (req, res) => {
    upload.single('avatar')(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err.message);
            return res.status(400).json({ message: err.message || 'Ошибка загрузки файла' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не выбран' });
        }

        try {
            // Удаляем старый аватар если это был загруженный файл (не dicebear URL)
            const oldUser = await User.findByPk(req.user.id, { attributes: ['avatar'] });
            if (oldUser?.avatar && oldUser.avatar.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '../../public', oldUser.avatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            const avatarUrl = `/uploads/${req.file.filename}`;
            await User.update({ avatar: avatarUrl }, { where: { id: req.user.id } });
            res.json({ avatarUrl, message: 'Аватар обновлён' });
        } catch (dbError) {
            console.error('DB error:', dbError.message);
            res.status(500).json({ message: 'Ошибка сохранения аватара' });
        }
    });
};

// ============================================================
// PUT /api/user/profile — обновление bio и других полей профиля
// НОВЫЙ МАРШРУТ — нужен для сохранения фактов о себе
// ============================================================
exports.updateProfile = async (req, res) => {
    try {
        const { bio } = req.body;
        const updateData = {};

        if (bio !== undefined) {
            updateData.bio = String(bio).substring(0, 1000);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'Нет данных для обновления' });
        }

        await User.update(updateData, { where: { id: req.user.id } });
        res.json({ message: 'Профиль обновлён' });
    } catch (error) {
        console.error('❌ updateProfile:', error.message);
        res.status(500).json({ message: 'Ошибка обновления профиля' });
    }
};