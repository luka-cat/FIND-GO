const { Place, User } = require('../models');

exports.getPlaces = async (req, res) => {
  try {
    const places = await Place.findAll({
      attributes: ['id', 'name', 'description', 'category']
    });
    res.json(places);
  } catch (error) {
    console.error('Ошибка загрузки мест:', error);
    res.status(500).json({ message: 'Ошибка загрузки мест' });
  }
};

// Получение мест по категории
exports.getPlacesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const places = await Place.findAll({
      where: { category: category },
      attributes: ['id', 'name', 'description', 'address', 'image']
    });
    res.json(places);
  } catch (error) {
    console.error('Ошибка загрузки мест по категории:', error);
    res.status(500).json({ message: 'Ошибка загрузки мест по категории' });
  }
};

// Получение интересов всех пользователей
exports.getAllUsersInterests = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'interests']
        });
        const formatted = users.map(u => ({
            id: u.id,
            name: u.name,
            interests: u.interests
        }));
        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка загрузки интересов' });
    }
};