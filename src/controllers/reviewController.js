const { Review, User, Event } = require('../models');
const db = require('../models');

// ========== ОСТАВИТЬ ОТЗЫВ ==========
exports.createReview = async (req, res) => {
    try {
        const fromUserId = req.user.id;
        const { toUserId, eventId, rating, comment } = req.body;

        if (fromUserId === parseInt(toUserId)) {
            return res.status(400).json({ message: 'Нельзя оставить отзыв самому себе' });
        }

        const event = await Event.findByPk(eventId);
        if (!event) return res.status(404).json({ message: 'Поход не найден' });
        if (event.status !== 'completed') return res.status(400).json({ message: 'Отзывы можно оставлять только после завершения похода' });

        // Проверяем участие обоих
        const isFromParticipant = await db.sequelize.query(
            'SELECT 1 FROM EventParticipants WHERE EventId = ? AND UserId = ? LIMIT 1',
            { replacements: [eventId, fromUserId], type: db.sequelize.QueryTypes.SELECT }
        );
        const isToParticipant = await db.sequelize.query(
            'SELECT 1 FROM EventParticipants WHERE EventId = ? AND UserId = ? LIMIT 1',
            { replacements: [eventId, toUserId], type: db.sequelize.QueryTypes.SELECT }
        );

        const fromIsCreator = event.creatorId === fromUserId;
        const toIsCreator = event.creatorId === parseInt(toUserId);

        if (!fromIsCreator && isFromParticipant.length === 0) {
            return res.status(403).json({ message: 'Вы не участвовали в этом походе' });
        }
        if (!toIsCreator && isToParticipant.length === 0) {
            return res.status(400).json({ message: 'Указанный пользователь не участвовал в этом походе' });
        }

        // Пытаемся создать (сработает ограничение unique index если уже есть)
        const review = await Review.create({
            fromUserId,
            toUserId,
            eventId,
            rating,
            comment
        });

        res.status(201).json({ message: 'Отзыв успешно сохранен', review });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Вы уже оставляли отзыв этому пользователю за данный поход' });
        }
        console.error(error);
        res.status(500).json({ message: 'Ошибка при сохранении отзыва' });
    }
};

// ========== ПОЛУЧИТЬ ОТЗЫВЫ ПОЛЬЗОВАТЕЛЯ ==========
exports.getUserReviews = async (req, res) => {
    try {
        const userId = req.params.id;

        // Получаем агрегированные данные
        const aggResult = await Review.findOne({
            where: { toUserId: userId },
            attributes: [
                [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'avgRating'],
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ]
        });

        const avgRating = parseFloat(aggResult.getDataValue('avgRating') || 0).toFixed(1);
        const count = parseInt(aggResult.getDataValue('count') || 0);

        // Получаем последние 5 отзывов с именами
        const reviews = await Review.findAll({
            where: { toUserId: userId },
            include: [{ model: User, as: 'fromUser', attributes: ['name', 'avatar'] }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        res.json({
            avgRating: parseFloat(avgRating),
            count,
            reviews: reviews.map(r => ({
                fromUserName: r.fromUser?.name || 'Неизвестный',
                fromUserAvatar: r.fromUser?.avatar,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при загрузке отзывов' });
    }
};
