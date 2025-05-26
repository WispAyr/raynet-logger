const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth, adminAuth } = require('../middleware/auth');

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('createdBy', 'callsign')
      .populate('operators', 'callsign')
      .sort({ startDate: -1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'callsign')
      .populate('operators', 'callsign')
      .populate('linkedEvents');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new event
router.post('/', auth, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      createdBy: req.user._id
    });
    
    const savedEvent = await event.save();
    req.app.get('io').emit('newEvent', savedEvent);
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Only allow updates by creator or admin
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    Object.assign(event, req.body);
    const updatedEvent = await event.save();
    req.app.get('io').emit('eventUpdated', updatedEvent);
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Only allow deletion by creator or admin
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    await event.deleteOne();
    req.app.get('io').emit('eventDeleted', req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Link events
router.post('/:id/link', auth, async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(req.params.id);
    const eventToLink = await Event.findById(eventId);
    
    if (!event || !eventToLink) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!event.linkedEvents.includes(eventId)) {
      event.linkedEvents.push(eventId);
      await event.save();
    }
    
    if (!eventToLink.linkedEvents.includes(req.params.id)) {
      eventToLink.linkedEvents.push(req.params.id);
      await eventToLink.save();
    }
    
    res.json({ message: 'Events linked successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add operator to event
router.post('/:id/operators', auth, async (req, res) => {
  try {
    const { operatorId } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (!event.operators.includes(operatorId)) {
      event.operators.push(operatorId);
      await event.save();
    }
    
    res.json({ message: 'Operator added to event' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 