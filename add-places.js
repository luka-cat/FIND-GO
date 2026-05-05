const db = require('./src/models');

async function addPlaces() {
  try {
    await db.sequelize.sync();
    
    await db.Place.bulkCreate([
      { name: 'Слеза Ала-Тоо', description: 'Красивый фонтан в центре Бишкека', category: 'прогулка' },
      { name: 'Дубовый парк', description: 'Уютный парк для прогулок', category: 'прогулка' },
      { name: 'Южные ворота', description: 'Смотровая площадка с видом на горы', category: 'прогулка' },
      { name: 'Караван-Сарай', description: 'Восточный комплекс', category: 'кафе' },
      { name: 'Парк Победы', description: 'Просторные аллеи', category: 'прогулка' },
      { name: 'Колотская ГЭС', description: 'Заброшенная ГЭС в ущелье', category: 'приключения' },
      { name: 'Арт-кафе Старый Баку', description: 'Уютное кафе с живой музыкой', category: 'кафе' },
      { name: 'Кыргызский драмтеатр', description: 'Культурный центр', category: 'культура' }
    ]);
    
    console.log('✅ Места успешно добавлены!');
    process.exit();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

addPlaces();
