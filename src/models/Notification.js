const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ✅ БАГ 9: Модель уведомлений
const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'info' // info | invite | join | accepted
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = Notification;