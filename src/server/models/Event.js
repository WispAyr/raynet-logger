const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
    default: 'ACTIVE'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Coordinates must be [longitude, latitude] within valid ranges'
      }
    },
    radius: {
      type: Number,
      min: 0
    }
  },
  zones: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['MEDICAL', 'SECURITY', 'COMMS', 'GENERAL'],
      required: true
    },
    coordinates: {
      type: [[Number]],
      required: true,
      validate: {
        validator: function(v) {
          return v.every(coord => 
            coord.length === 2 && 
            coord[0] >= -180 && coord[0] <= 180 && 
            coord[1] >= -90 && coord[1] <= 90
          );
        },
        message: 'Zone coordinates must be valid [longitude, latitude] pairs'
      }
    },
    color: {
      type: String,
      required: true,
      default: '#000000'
    },
    description: String
  }],
  operators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'BREAK', 'OFFLINE'],
      default: 'OFFLINE'
    },
    currentZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone'
    },
    lastCheckIn: Date
  }],
  channels: [{
    name: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      enum: ['FM', 'DMR', 'D-STAR'],
      required: true
    },
    purpose: {
      type: String,
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  talkgroups: [{
    name: {
      type: String,
      required: true
    },
    description: String
  }],
  checkInInterval: {
    type: Number,
    min: 1,
    default: 30 // Default to 30 minutes
  },
  welfareCheckInterval: {
    type: Number,
    min: 1,
    default: 60 // Default to 60 minutes
  }
}, {
  timestamps: true
});

// Index for geospatial queries
eventSchema.index({ 'location.coordinates': '2dsphere' });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 