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
      .populate('operators.user', 'callsign')
      .sort({ startDate: -1 });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get single event
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'callsign')
      .populate('operators.user', 'callsign')
      .populate('channels.assignedTo', 'callsign');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' });
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
    console.error('Error creating event:', error);
    res.status(400).json({ message: 'Error creating event' });
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
    console.error('Error updating event:', error);
    res.status(400).json({ message: 'Error updating event' });
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
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
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

// Operator check-in
router.post('/:id/check-in', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const operatorIndex = event.operators.findIndex(
      op => op.user.toString() === req.user._id.toString()
    );

    if (operatorIndex === -1) {
      return res.status(403).json({ message: 'Not authorized to check in to this event' });
    }

    event.operators[operatorIndex].status = 'ACTIVE';
    event.operators[operatorIndex].lastCheckIn = new Date();
    await event.save();

    res.json({ message: 'Check-in successful' });
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ message: 'Error checking in' });
  }
});

// Operator welfare check
router.post('/:id/welfare-check', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const operatorIndex = event.operators.findIndex(
      op => op.user.toString() === req.user._id.toString()
    );

    if (operatorIndex === -1) {
      return res.status(403).json({ message: 'Not authorized to perform welfare check for this event' });
    }

    // Create a log entry for the welfare check
    const logEntry = new LogEntry({
      event: event._id,
      operator: req.user._id,
      messageType: 'CHECK-IN',
      message: 'Welfare check completed',
      timestamp: new Date()
    });
    await logEntry.save();

    res.json({ message: 'Welfare check recorded' });
  } catch (error) {
    console.error('Error performing welfare check:', error);
    res.status(500).json({ message: 'Error performing welfare check' });
  }
});

// Update operator status
router.put('/:id/operator-status', auth, async (req, res) => {
  try {
    const { status, zoneId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const operatorIndex = event.operators.findIndex(
      op => op.user.toString() === req.user._id.toString()
    );

    if (operatorIndex === -1) {
      return res.status(403).json({ message: 'Not authorized to update status for this event' });
    }

    event.operators[operatorIndex].status = status;
    if (zoneId) {
      event.operators[operatorIndex].currentZone = zoneId;
    }
    await event.save();

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating operator status:', error);
    res.status(500).json({ message: 'Error updating operator status' });
  }
});

module.exports = router; 