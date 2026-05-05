const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Place = sequelize.define('Place', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'other'
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: ''
  }
});

module.exports = Place;