const express = require('express');
const upload = require('./middleware')
const { createEvent, getEvents, getEventsById, updateEvent, deleteEvent } = require('./controllers');

const router = express.Router()

router.route('/').post( upload.single('image'), createEvent).get(getEvents).get(getEventsById);

router.route('/:id').put( upload.single('image'), updateEvent).delete(deleteEvent);

module.exports = router;