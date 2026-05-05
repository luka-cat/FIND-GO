const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Message;