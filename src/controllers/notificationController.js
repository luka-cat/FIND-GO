const { Notification } = require('../models');

// ✅ БАГ 9: Получить уведомления текущего пользователя
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(notifications);
    } catch (error) {
        console.error('❌ getNotifications:', error.message);
        res.status(500).json({ message: 'Ошибка загрузки уведомлений' });
    }
};

// ✅ Количество непрочитанных (для бейджа)
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.count({
            where: { userId: req.user.id, read: false }
        });
        res.json({ count });
    } catch (error) {
        console.error('❌ getUnreadCount:', error.message);
        res.status(500).json({ message: 'Ошибка' });
    }
};

// ✅ Отметить все как прочитанные
exports.markAllRead = async (req, res) => {
    try {
        await Notification.update(
            { read: true },
            { where: { userId: req.user.id, read: false } }
        );
        res.json({ message: 'Все уведомления прочитаны' });
    } catch (error) {
        console.error('❌ markAllRead:', error.message);
        res.status(500).json({ message: 'Ошибка' });
    }
};

// ✅ Внутренняя функция для создания уведомления (вызывается из других контроллеров)
exports.createNotification = async (userId, title, message, type = 'info') => {
    try {
        await Notification.create({ userId, title, message, type });
    } catch (error) {
        console.error('❌ createNotification:', error.message);
    }
};