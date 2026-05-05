const express = require('express');
const { 
  createEvent, 
  getActiveEvents, 
  joinEvent, 
  getEventById, 
  updateEvent, 
  deleteEvent, 
  getEventMessages, 
  getEventParticipants,
  getMyEvents,
  completeEvent
} = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/events', authMiddleware, createEvent);
router.get('/events', authMiddleware, getActiveEvents);
router.get('/events/user', authMiddleware, getMyEvents);
router.get('/events/:id', authMiddleware, getEventById);
router.get('/events/:id/messages', authMiddleware, getEventMessages);
router.get('/events/:id/participants', authMiddleware, getEventParticipants);
router.post('/events/:id/join', authMiddleware, joinEvent);
router.post('/events/:id/complete', authMiddleware, completeEvent);
router.put('/events/:id', authMiddleware, updateEvent);
router.delete('/events/:id', authMiddleware, deleteEvent);

module.exports = router;