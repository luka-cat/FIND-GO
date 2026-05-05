const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  // === Настройка для PostgreSQL на Render ===
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Отключает вывод SQL-запросов в консоль, можно включить для отладки
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Обязательно для подключения к БД на Render
      },
    },
  });
} else {
  // === Локальная настройка для SQLite ===
  const path = require('path');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false,
  });
}

module.exports = sequelize;