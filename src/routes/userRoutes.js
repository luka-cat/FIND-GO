const express = require('express');
const { uploadAvatar, updateProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/avatar — загрузка аватара
router.post('/avatar', authMiddleware, uploadAvatar);

// PUT /api/user/profile — обновление bio (факты о себе)
// НОВЫЙ МАРШРУТ — вызывается из profile.html при сохранении
router.put('/user/profile', authMiddleware, updateProfile);

module.exports = router;