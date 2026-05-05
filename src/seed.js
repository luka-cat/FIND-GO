const db = require('./models');

const seed = async () => {
  await db.sequelize.sync({ force: true }); // Осторожно! Удалит все данные. Для разработки.
  
  await db.Place.bulkCreate([
    { name: 'Слеза Ала-Тоо', description: 'Красивый фонтан в центре Бишкека', category: 'прогулка', image: 'https://images.pexels.com/photos/2372720/pexels-photo-2372720.jpeg' },
    { name: 'Дубовый парк', description: 'Уютное место для прогулок', category: 'прогулка', image: 'https://images.pexels.com/photos/158028/bellingrath-gardens-bellingrath-gardens-mobile-al-spring-158028.jpeg' },
    { name: 'Южные ворота', description: 'Смотровая площадка с видом на горы', category: 'прогулка', image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg' }
  ]);
  
  console.log('База данных заполнена начальными местами');
  process.exit();
};

seed();