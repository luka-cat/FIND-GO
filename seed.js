const db = require('./src/models');

async function seed() {
  try {
    // Убедимся, что таблицы созданы (без force: true)
    await db.sequelize.sync();

    const count = await db.Place.count();
    if (count === 0) {
      await db.Place.bulkCreate([
        // ... список ваших мест
      ]);
      console.log('✅ Места добавлены!');
    } else {
      console.log('✅ Места уже есть, пропускаем');
    }
    process.exit();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

seed();