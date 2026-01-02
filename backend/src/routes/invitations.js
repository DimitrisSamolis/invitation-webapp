const express = require('express');
const { body, validationResult } = require('express-validator');
const Invitation = require('../models/Invitation');
const Guest = require('../models/Guest');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    // Get only invitations created by the logged-in user
    const userInvitations = await Invitation.find({ createdBy: req.user._id }).select('_id');
    const userInvitationIds = userInvitations.map(inv => inv._id);

    const totalInvitations = await Invitation.countDocuments({ createdBy: req.user._id });
    const activeInvitations = await Invitation.countDocuments({ createdBy: req.user._id, isActive: true });
    const totalGuests = await Guest.countDocuments({ invitationId: { $in: userInvitationIds } });
    const confirmedGuests = await Guest.countDocuments({ invitationId: { $in: userInvitationIds }, rsvpStatus: 'confirmed' });
    const pendingResponses = await Guest.countDocuments({ invitationId: { $in: userInvitationIds }, rsvpStatus: 'pending' });
    const declinedGuests = await Guest.countDocuments({ invitationId: { $in: userInvitationIds }, rsvpStatus: 'declined' });

    res.json({
      totalInvitations,
      activeInvitations,
      totalGuests,
      confirmedGuests,
      pendingResponses,
      declinedGuests
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all invitations for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const invitations = await Invitation.find({ createdBy: req.user._id })
      .populate('theme')
      .sort({ createdAt: -1 });
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get invitation by ID
router.get('/:id', async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id).populate('theme');
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get invitation by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ slug: req.params.slug }).populate('theme');
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create invitation
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('eventType').isIn(['wedding', 'birthday', 'corporate', 'party', 'other']),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('eventTime').notEmpty().withMessage('Event time is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  body('venueAddress').notEmpty().withMessage('Venue address is required'),
  body('hostName').notEmpty().withMessage('Host name is required'),
  body('slug').notEmpty().withMessage('Slug is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check for unique slug
    const existingSlug = await Invitation.findOne({ slug: req.body.slug });
    if (existingSlug) {
      // Append random string to make unique
      req.body.slug = `${req.body.slug}-${Date.now()}`;
    }

    // Remove empty theme to avoid ObjectId cast error
    if (!req.body.theme || req.body.theme === '') {
      delete req.body.theme;
    }

    const invitation = new Invitation({
      ...req.body,
      createdBy: req.user._id
    });

    await invitation.save();
    res.status(201).json(invitation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update invitation
router.put('/:id', auth, async (req, res) => {
  try {
    // Remove empty theme to avoid ObjectId cast error
    if (!req.body.theme || req.body.theme === '') {
      delete req.body.theme;
    }

    // Only update if the invitation belongs to the logged-in user
    const invitation = await Invitation.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle active status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    // Only toggle if the invitation belongs to the logged-in user
    const invitation = await Invitation.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { isActive: req.body.isActive },
      { new: true }
    );
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete invitation
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only delete if the invitation belongs to the logged-in user
    const invitation = await Invitation.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Also delete associated guests
    await Guest.deleteMany({ invitationId: req.params.id });
    
    res.json({ message: 'Invitation deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
