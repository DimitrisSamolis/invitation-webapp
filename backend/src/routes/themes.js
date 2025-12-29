const express = require('express');
const { body, validationResult } = require('express-validator');
const Theme = require('../models/Theme');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all themes
router.get('/', async (req, res) => {
  try {
    const themes = await Theme.find().sort({ isDefault: -1, createdAt: -1 });
    res.json(themes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get theme by ID
router.get('/:id', async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create theme
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('primaryColor').notEmpty().withMessage('Primary color is required'),
  body('accentColor').notEmpty().withMessage('Accent color is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const theme = new Theme({
      ...req.body,
      createdBy: req.user._id
    });

    await theme.save();
    res.status(201).json(theme);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update theme
router.put('/:id', auth, async (req, res) => {
  try {
    const theme = await Theme.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Set as default theme
router.patch('/:id/default', auth, async (req, res) => {
  try {
    // Remove default from all themes
    await Theme.updateMany({}, { isDefault: false });
    
    // Set this theme as default
    const theme = await Theme.findByIdAndUpdate(
      req.params.id,
      { isDefault: true },
      { new: true }
    );
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete theme
router.delete('/:id', auth, async (req, res) => {
  try {
    const theme = await Theme.findByIdAndDelete(req.params.id);
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    res.json({ message: 'Theme deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
