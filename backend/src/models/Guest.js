const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  invitationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invitation',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    default: ''
  },
  numberOfGuests: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  rsvpStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'declined'],
    default: 'pending'
  },
  dietaryRestrictions: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster lookups
guestSchema.index({ invitationId: 1 });
guestSchema.index({ email: 1, invitationId: 1 });

module.exports = mongoose.model('Guest', guestSchema);
