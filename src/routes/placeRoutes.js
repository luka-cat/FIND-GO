const express = require('express');
const { getPlaces, getPlacesByCategory, getAllUsersInterests } = require('../controllers/placeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/places', authMiddleware, getPlaces);
router.get('/places/category/:category', authMiddleware, getPlacesByCategory);
router.get('/users/interests', authMiddleware, getAllUsersInterests);

module.exports = router;