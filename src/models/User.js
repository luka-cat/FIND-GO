const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  interests: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
        const raw = this.getDataValue('interests');
        return raw ? JSON.parse(raw) : [];
    },
    set(value) {
        this.setDataValue('interests', JSON.stringify(value));
    }
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
});

User.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;