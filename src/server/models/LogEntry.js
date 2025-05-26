const mongoose = require('mongoose');

const logEntrySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  callsign: {
    type: String,
    required: true,
    trim: true
  },
  talkgroup: {
    type: String,
    required: true,
    trim: true
  },
  channel: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['INFO', 'URGENT', 'CHECK-IN', 'OTHER'],
    default: 'INFO'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
logEntrySchema.index({ timestamp: -1 });
logEntrySchema.index({ event: 1 });
logEntrySchema.index({ talkgroup: 1 });
logEntrySchema.index({ channel: 1 });

module.exports = mongoose.model('LogEntry', logEntrySchema); 