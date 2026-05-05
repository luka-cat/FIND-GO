const db = require('./src/models');

async function addPlaces() {
  await db.sequelize.sync();
  
  await db.Place.bulkCreate([
    { name: 'Слеза Ала-Тоо', description: 'Красивый фонтан', category: 'прогулка' },
    { name: 'Дубовый парк', description: 'Уютный парк', category: 'прогулка' },
    { name: 'Южные ворота', description: 'Смотровая площадка', category: 'прогулка' },
    { name: 'Караван-Сарай', description: 'Восточный комплекс', category: 'кафе' },
    { name: 'Парк Победы', description: 'Просторные аллеи', category: 'прогулка' },
    { name: 'Колотская ГЭС', description: 'Заброшенная ГЭС', category: 'приключения' },
    { name: 'Арт-кафе Старый Баку', description: 'Уютное кафе', category: 'кафе' },
    { name: 'Кыргызский драмтеатр', description: 'Культурный центр', category: 'культура' }
  ]);
  
  console.log('✅ Места добавлены!');
  process.exit();
}

addPlaces();