const sequelize = require('../config/database');
const User = require('./User');
const Place = require('./Place');
const Event = require('./Event');
const Message = require('./Message');
const Invite = require('./Invite');
const Notification = require('./Notification'); // ✅ БАГ 9
const Review = require('./Review');

// Базовые ассоциации
Event.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
Event.belongsTo(Place, { as: 'place', foreignKey: 'placeId' });
User.hasMany(Event, { as: 'createdEvents', foreignKey: 'creatorId' });

Invite.belongsTo(User, { as: 'fromUser', foreignKey: 'fromUserId' });
Invite.belongsTo(User, { as: 'toUser', foreignKey: 'toUserId' });
Invite.belongsTo(Event, { as: 'event', foreignKey: 'eventId' });
User.hasMany(Invite, { as: 'sentInvites', foreignKey: 'fromUserId' });
User.hasMany(Invite, { as: 'receivedInvites', foreignKey: 'toUserId' });

// ✅ Ассоциации уведомлений
User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// ✅ Ассоциации отзывов
Review.belongsTo(User, { as: 'fromUser', foreignKey: 'fromUserId' });
Review.belongsTo(User, { as: 'toUser', foreignKey: 'toUserId' });
Review.belongsTo(Event, { as: 'event', foreignKey: 'eventId', onDelete: 'CASCADE' });
User.hasMany(Review, { as: 'receivedReviews', foreignKey: 'toUserId' });
Event.hasMany(Review, { as: 'reviews', foreignKey: 'eventId', onDelete: 'CASCADE' });

const db = { sequelize, User, Place, Event, Message, Invite, Notification, Review };
module.exports = db;