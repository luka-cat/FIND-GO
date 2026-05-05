const express = require('express');
const { sendInvite, getInvites, acceptInvite, rejectInvite, getPendingCount } = require('../controllers/inviteController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/invite', authMiddleware, sendInvite);
router.get('/invites', authMiddleware, getInvites);
// ✅ БАГ 4: эндпоинт для бейджа конверта
router.get('/invites/pending-count', authMiddleware, getPendingCount);
router.post('/invite/:id/accept', authMiddleware, acceptInvite);
router.post('/invite/:id/reject', authMiddleware, rejectInvite);

module.exports = router;