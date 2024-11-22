const { ObjectId } = require('mongodb');
const { client } = require('./db');

const createEvent = async (req, res) => {
    const { type, name, tagline, schedule, description, moderator, category, sub_category, rigor_rank, attendees } = req.body;
    
    const imageFile = req.file;
  
    // if (!type || !name || !schedule || !moderator || !category || !rigor_rank) {
    //   return res.status(400).json({ error: 'Missing required fields' });
    // }
  
    const eventSchedule = new Date(schedule);
    if (isNaN(eventSchedule.getTime())) {
      return res.status(400).json({ error: 'Invalid schedule timestamp' });
    }
  
    let attendeesArray = [];
    if (attendees) {
      if (typeof attendees === 'string') {
        attendeesArray = attendees.split(',').map(Number);
      } else if (Array.isArray(attendees)) {
        attendeesArray = attendees.map(Number); 
      }
    }
  
    const eventData = {
      type,
      name,
      tagline,
      schedule: eventSchedule,
      description,
      image: imageFile ? imageFile.path : null, // Save image path
      moderator,
      category,
      sub_category,
      rigor_rank,
      attendees: attendeesArray, // Ensure it's an array of user IDs
    };
  
    try {
      const database = client.db('Challenges'); 
      const eventsCollection = database.collection('events');
  
      const result = await eventsCollection.insertOne(eventData);
  
      res.status(201).json({
        message: 'Event created successfully',
        event: { ...eventData, _id: result.insertedId.toString() },
      });
    } catch (error) {
      console.error('Error inserting event into MongoDB:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }

const getEvents = async (req, res) => {
    const { type = "latest", limit = 5, page = 1 } = req.query;
  
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
  
    if (isNaN(pageNum) || pageNum <= 0) {
      return res.status(400).json({ error: 'Invalid page number' });
    }
  
    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({ error: 'Invalid limit value' });
    }
  
    const filters = {}; 
  
    const skip = (pageNum - 1) * limitNum;
    const limitOptions = limitNum;
  
    try {
      const database = client.db('Challenges');
      const eventsCollection = database.collection('events'); 
  
      const events = await eventsCollection.find(filters)
        .sort({ schedule: -1 })
        .skip(skip)              
        .limit(limitOptions)
        .toArray();
  
      const totalEvents = await eventsCollection.countDocuments(filters);
  
      const formattedEvents = events.map(event => ({
        ...event,
        _id: event._id.toString()
      }));
  
      res.status(200).json({
        events: formattedEvents,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalEvents / limitNum),
          totalEvents: totalEvents,
          limit: limitNum
        }
      });
    } catch (error) {
      console.error('Error fetching events from MongoDB:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  }

const getEventsById =
 async (req, res) => { 
    const { id } = req.query;
  
    if (!id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }
  
    try {
      const database = client.db('Challenges');
      const eventsCollection = database.collection('events'); 
  
      const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
  
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      res.status(200).json({
        event
      });
    } catch (error) {
      console.error('Error fetching event from MongoDB:', error);
      res.status(500).json({ error: 'Failed to fetch event' });
    }
  }

const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { type, name, tagline, schedule, description, moderator, category, sub_category, rigor_rank, attendees } = req.body;
  
    const imageFile = req.file;
  
    // if (!type || !name || !schedule || !moderator || !category || !rigor_rank) {
    //   return res.status(400).json({ error: 'Missing required fields' });
    // }
  
    const eventSchedule = new Date(schedule);
    if (isNaN(eventSchedule.getTime())) {
      return res.status(400).json({ error: 'Invalid schedule timestamp' });
    }
  
    let attendeesArray = [];
    if (attendees) {
      if (typeof attendees === 'string') {
        attendeesArray = attendees.split(',').map(Number);
      } else if (Array.isArray(attendees)) {
        attendeesArray = attendees.map(Number);
      }
    }
  
    const updatedEventData = {
      type,
      name,
      tagline,
      schedule: eventSchedule,
      description,
      image: imageFile ? imageFile.path : undefined,
      moderator,
      category,
      sub_category,
      rigor_rank,
      attendees: attendeesArray,
    };
  
    try {
      const database = client.db('Challenges'); 
      const eventsCollection = database.collection('events');
  
      const result = await eventsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedEventData }
      );
  
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      res.status(200).json({
        message: 'Event updated successfully',
        updatedEvent: { ...updatedEventData, _id: id }
      });
    } catch (error) {
      console.error('Error updating event in MongoDB:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  }

const deleteEvent = async (req, res) => {
    const { id } = req.params;
  
    try {
      const database = client.db('Challenges');
      const eventsCollection = database.collection('events'); 
  
      const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      res.status(200).json({
        message: 'Event deleted successfully',
        _id: id
      });
    } catch (error) {
      console.error('Error deleting event in MongoDB:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  }

module.exports = {createEvent, getEvents, getEventsById, updateEvent, deleteEvent}