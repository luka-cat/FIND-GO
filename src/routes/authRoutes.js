const express = require('express');
const {
    register,
    login,
    getProfile,
    updateInterests,
    getInterests,
    getUserById      // ← НОВЫЙ маршрут
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Публичные маршруты
router.post('/register', register);
router.post('/login',    login);

// Приватные маршруты (требуют токен)
router.get('/profile',           authMiddleware, getProfile);
router.put('/interests',         authMiddleware, updateInterests);
router.get('/interests/all',     authMiddleware, getInterests);

// НОВЫЙ: профиль другого пользователя (без email)
router.get('/users/:id',         authMiddleware, getUserById);

module.exports = router;