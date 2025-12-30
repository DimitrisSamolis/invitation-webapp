const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  eventType: {
    type: String,
    enum: ['wedding', 'birthday', 'corporate', 'party', 'other'],
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventTime: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  venueAddress: {
    type: String,
    required: true
  },
  venueMapUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  dressCode: {
    type: String,
    default: ''
  },
  additionalInfo: {
    type: String,
    default: ''
  },
  theme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theme'
  },
  customStyles: {
    primaryColor: String,
    accentColor: String,
    fontFamily: String,
    backgroundImage: String,
    animation: {
      type: String,
      enum: ['confetti', 'hearts', 'balloons', 'sparkles', 'stars', 'fireworks', 'none'],
      default: 'none'
    }
  },
  hostName: {
    type: String,
    required: true
  },
  hostContact: {
    type: String,
    default: ''
  },
  hostEmail: {
    type: String,
    default: ''
  },
  rsvpDeadline: {
    type: Date
  },
  maxGuests: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for slug lookup
invitationSchema.index({ slug: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);
