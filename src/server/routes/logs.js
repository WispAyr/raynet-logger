const express = require('express');
const router = express.Router();
const LogEntry = require('../models/LogEntry');

// Get all logs with optional filtering
router.get('/', async (req, res) => {
  try {
    const { event, talkgroup, channel, startDate, endDate } = req.query;
    const query = {};

    if (event) query.event = event;
    if (talkgroup) query.talkgroup = talkgroup;
    if (channel) query.channel = channel;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await LogEntry.find(query)
      .sort({ timestamp: -1 })
      .populate('operator', 'callsign')
      .populate('event', 'name');
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new log entry
router.post('/', async (req, res) => {
  try {
    const logEntry = new LogEntry({
      ...req.body,
      operator: req.user._id // Will be set by auth middleware
    });
    
    const savedEntry = await logEntry.save();
    const populatedEntry = await LogEntry.findById(savedEntry._id)
      .populate('operator', 'callsign')
      .populate('event', 'name');
    
    req.app.get('io').emit('newLog', populatedEntry);
    res.status(201).json(populatedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get specific log
router.get('/:id', async (req, res) => {
  try {
    const log = await LogEntry.findById(req.params.id)
      .populate('operator', 'callsign');
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update log entry
router.put('/:id', async (req, res) => {
  try {
    const log = await LogEntry.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    
    Object.assign(log, req.body);
    const updatedLog = await log.save();
    const populatedLog = await LogEntry.findById(updatedLog._id)
      .populate('operator', 'callsign')
      .populate('event', 'name');
    
    req.app.get('io').emit('logUpdated', populatedLog);
    res.json(populatedLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete log entry
router.delete('/:id', async (req, res) => {
  try {
    const log = await LogEntry.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    
    await log.deleteOne();
    req.app.get('io').emit('logDeleted', req.params.id);
    res.json({ message: 'Log deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 