require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const invitationRoutes = require('./routes/invitations');
const guestRoutes = require('./routes/guests');
const themeRoutes = require('./routes/themes');
const Theme = require('./models/Theme');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/themes', themeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Handle payload too large error
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      message: 'Request payload is too large. Maximum size is 10MB.',
      error: 'PAYLOAD_TOO_LARGE'
    });
  }
  
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      message: 'Invalid JSON in request body.',
      error: 'INVALID_JSON'
    });
  }
  
  // Handle validation errors (Mongoose)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      message: messages.join(', '),
      error: 'VALIDATION_ERROR'
    });
  }
  
  // Handle duplicate key errors (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ 
      message: `A record with this ${field} already exists.`,
      error: 'DUPLICATE_KEY'
    });
  }
  
  // Handle cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      message: `Invalid ${err.path}: ${err.value}`,
      error: 'CAST_ERROR'
    });
  }
  
  // Default error
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({ 
    message: err.message || 'Something went wrong!',
    error: err.name || 'SERVER_ERROR'
  });
});

// Seed default themes
async function seedDefaultThemes() {
  const count = await Theme.countDocuments();
  if (count === 0) {
    const defaultThemes = [
      {
        name: 'Elegant Purple',
        description: 'A sophisticated purple gradient theme',
        primaryColor: '#667eea',
        accentColor: '#764ba2',
        fontFamily: 'Playfair Display, serif',
        isDefault: true
      },
      {
        name: 'Romantic Rose',
        description: 'Perfect for weddings and romantic events',
        primaryColor: '#e91e63',
        accentColor: '#f8bbd9',
        fontFamily: 'Great Vibes, cursive'
      },
      {
        name: 'Modern Teal',
        description: 'Clean and modern design',
        primaryColor: '#00695c',
        accentColor: '#b2dfdb',
        fontFamily: 'Roboto, sans-serif'
      },
      {
        name: 'Festive Gold',
        description: 'Celebrate in style with gold accents',
        primaryColor: '#ff8f00',
        accentColor: '#ffe082',
        fontFamily: 'Montserrat, sans-serif'
      },
      {
        name: 'Classic Navy',
        description: 'Timeless and professional',
        primaryColor: '#1a237e',
        accentColor: '#c5cae9',
        fontFamily: 'Lora, serif'
      }
    ];
    await Theme.insertMany(defaultThemes);
    console.log('Default themes created');
  }
}

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/invitation-webapp';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedDefaultThemes();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;
