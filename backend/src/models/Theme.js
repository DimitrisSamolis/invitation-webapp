const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  primaryColor: {
    type: String,
    required: true,
    default: '#667eea'
  },
  accentColor: {
    type: String,
    required: true,
    default: '#764ba2'
  },
  fontFamily: {
    type: String,
    default: 'Roboto, sans-serif'
  },
  backgroundImage: {
    type: String,
    default: ''
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Theme', themeSchema);
