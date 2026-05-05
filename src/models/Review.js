const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fromUserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  toUserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['fromUserId', 'toUserId', 'eventId']
    }
  ]
});

module.exports = Review;
