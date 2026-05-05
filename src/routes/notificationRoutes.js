const express = require('express');
const { getNotifications, getUnreadCount, markAllRead } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/notifications', authMiddleware, getNotifications);
router.get('/notifications/unread-count', authMiddleware, getUnreadCount);
router.post('/notifications/mark-read', authMiddleware, markAllRead);

module.exports = router;