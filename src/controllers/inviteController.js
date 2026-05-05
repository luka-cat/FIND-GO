const { Invite, User, Event, Place } = require('../models');
const db = require('../models');
const { createNotification } = require('./notificationController');

// ✅ БАГ 5: Отправить приглашение — создаём уведомление получателю
exports.sendInvite = async (req, res) => {
    try {
        const { toUserId, eventId, placeName } = req.body;
        const fromUserId = req.user.id;

        if (!toUserId || !placeName) {
            return res.status(400).json({ message: 'Не указан получатель или место' });
        }

        const existing = await Invite.findOne({
            where: { fromUserId, toUserId, status: 'pending' }
        });
        if (existing) {
            return res.status(400).json({ message: 'Приглашение уже отправлено' });
        }

        const invite = await Invite.create({ fromUserId, toUserId, eventId: eventId || null, placeName });

        // ✅ БАГ 5: создаём уведомление для получателя
        const sender = await User.findByPk(fromUserId, { attributes: ['name'] });
        await createNotification(
            toUserId,
            '📩 Новое приглашение',
            `${sender?.name || 'Пользователь'} приглашает тебя в "${placeName}"`,
            'invite'
        );

        res.status(201).json(invite);
    } catch (error) {
        console.error('❌ sendInvite:', error.message);
        res.status(500).json({ message: 'Ошибка при отправке приглашения' });
    }
};

// ✅ БАГ 3: acceptInvite теперь возвращает eventId и eventPlaceName
exports.acceptInvite = async (req, res) => {
    try {
        const inviteId = req.params.id;
        const userId = req.user.id;

        const invite = await Invite.findByPk(inviteId);
        if (!invite) return res.status(404).json({ message: 'Приглашение не найдено' });
        if (invite.toUserId !== userId) return res.status(403).json({ message: 'Не ваше приглашение' });

        let eventId = invite.eventId;
        let eventPlaceName = invite.placeName;

        // Если eventId задан — добавляем в участники
        if (eventId) {
            const event = await Event.findByPk(eventId, {
                include: [{ model: Place, as: 'place' }]
            });
            if (event) {
                eventPlaceName = event.place?.name || invite.placeName;

                const now = new Date();
                // SQLite: INSERT OR IGNORE / PostgreSQL: ON CONFLICT DO NOTHING
                const dialect = db.sequelize.getDialect();
                if (dialect === 'sqlite') {
                    await db.sequelize.query(
                        `INSERT OR IGNORE INTO EventParticipants (EventId, UserId, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
                        { replacements: [eventId, userId, now, now] }
                    );
                } else {
                    await db.sequelize.query(
                        `INSERT INTO "EventParticipants" ("EventId", "UserId", "createdAt", "updatedAt") VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING`,
                        { replacements: [eventId, userId, now, now] }
                    );
                }
            }
        }

        invite.status = 'accepted';
        await invite.save();

        // ✅ БАГ 5: уведомляем отправителя о принятии
        const acceptor = await User.findByPk(userId, { attributes: ['name'] });
        await createNotification(
            invite.fromUserId,
            '✅ Приглашение принято',
            `${acceptor?.name || 'Пользователь'} принял твоё приглашение в "${eventPlaceName}"`,
            'accepted'
        );

        res.json({
            message: 'Приглашение принято! Вы добавлены в поход.',
            eventId,           // ✅ БАГ 3: фронтенд получает eventId для кнопки Чат
            eventPlaceName
        });
    } catch (error) {
        console.error('❌ acceptInvite:', error.message);
        res.status(500).json({ message: 'Ошибка при принятии приглашения' });
    }
};

// Отклонить приглашение
exports.rejectInvite = async (req, res) => {
    try {
        const inviteId = req.params.id;
        const invite = await Invite.findByPk(inviteId);
        if (!invite) return res.status(404).json({ message: 'Приглашение не найдено' });
        if (invite.toUserId !== req.user.id) return res.status(403).json({ message: 'Доступ запрещён' });

        invite.status = 'rejected';
        await invite.save();
        res.json({ message: 'Приглашение отклонено' });
    } catch (error) {
        console.error('❌ rejectInvite:', error.message);
        res.status(500).json({ message: 'Ошибка при отклонении приглашения' });
    }
};

// Получить все приглашения
exports.getInvites = async (req, res) => {
    try {
        const userId = req.user.id;
        const incoming = await Invite.findAll({
            where: { toUserId: userId, status: 'pending' },
            include: [{ model: User, as: 'fromUser', attributes: ['id', 'name', 'avatar'] }]
        });
        const outgoing = await Invite.findAll({
            where: { fromUserId: userId },
            include: [{ model: User, as: 'toUser', attributes: ['id', 'name', 'avatar'] }]
        });
        res.json({ incoming, outgoing });
    } catch (error) {
        console.error('❌ getInvites:', error.message);
        res.status(500).json({ message: 'Ошибка загрузки приглашений' });
    }
};

// ✅ БАГ 4: Количество входящих pending-приглашений (для бейджа конверта)
exports.getPendingCount = async (req, res) => {
    try {
        const count = await Invite.count({
            where: { toUserId: req.user.id, status: 'pending' }
        });
        res.json({ count });
    } catch (error) {
        console.error('❌ getPendingCount:', error.message);
        res.status(500).json({ message: 'Ошибка' });
    }
};

// ✅ Количество pending-приглашений для бейджа
exports.getPendingCount = async (req, res) => {
    try {
        const count = await Invite.count({
            where: { toUserId: req.user.id, status: 'pending' }
        });
        res.json({ count });
    } catch (error) {
        console.error('❌ getPendingCount:', error.message);
        res.status(500).json({ message: 'Ошибка' });
    }
};