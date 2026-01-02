const express = require('express');
const { body, validationResult } = require('express-validator');
const Guest = require('../models/Guest');
const Invitation = require('../models/Invitation');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all guests (admin - only for user's invitations)
router.get('/', auth, async (req, res) => {
  try {
    // Get only invitations created by the logged-in user
    const userInvitations = await Invitation.find({ createdBy: req.user._id }).select('_id');
    const userInvitationIds = userInvitations.map(inv => inv._id);

    const guests = await Guest.find({ invitationId: { $in: userInvitationIds } })
      .populate('invitationId', 'title')
      .sort({ createdAt: -1 });
    res.json(guests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get guests by invitation
router.get('/invitation/:invitationId', auth, async (req, res) => {
  try {
    // Verify the invitation belongs to the logged-in user
    const invitation = await Invitation.findOne({ _id: req.params.invitationId, createdBy: req.user._id });
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    const guests = await Guest.find({ invitationId: req.params.invitationId })
      .sort({ createdAt: -1 });
    res.json(guests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get guest by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).populate('invitationId');
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Verify the guest's invitation belongs to the logged-in user
    const invitation = await Invitation.findOne({ _id: guest.invitationId._id, createdBy: req.user._id });
    if (!invitation) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.json(guest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit RSVP (public)
router.post('/rsvp/:invitationId', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('rsvpStatus').isIn(['confirmed', 'declined']).withMessage('Invalid RSVP status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { invitationId } = req.params;
    
    // Check if invitation exists and is active
    const invitation = await Invitation.findById(invitationId);
    if (!invitation || !invitation.isActive) {
      return res.status(404).json({ message: 'Invitation not found or inactive' });
    }

    // Check RSVP deadline
    if (invitation.rsvpDeadline && new Date() > new Date(invitation.rsvpDeadline)) {
      return res.status(400).json({ message: 'RSVP deadline has passed' });
    }

    // Check if guest already RSVPd (only if email provided)
    let existingGuest = null;
    if (req.body.email) {
      existingGuest = await Guest.findOne({ 
        invitationId, 
        email: req.body.email.toLowerCase() 
      });
    }
    
    if (existingGuest) {
      // Update existing RSVP
      existingGuest.name = req.body.name;
      existingGuest.phone = req.body.phone || '';
      existingGuest.numberOfGuests = req.body.numberOfGuests || 1;
      existingGuest.rsvpStatus = req.body.rsvpStatus;
      existingGuest.dietaryRestrictions = req.body.dietaryRestrictions || '';
      existingGuest.message = req.body.message || '';
      existingGuest.respondedAt = new Date();
      
      await existingGuest.save();
      return res.json(existingGuest);
    }

    // Create new guest
    const guest = new Guest({
      invitationId,
      ...req.body,
      respondedAt: new Date()
    });

    await guest.save();
    res.status(201).json(guest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create guest (admin)
router.post('/', auth, [
  body('invitationId').notEmpty().withMessage('Invitation ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify the invitation belongs to the logged-in user
    const invitation = await Invitation.findOne({ _id: req.body.invitationId, createdBy: req.user._id });
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    const guest = new Guest(req.body);
    await guest.save();
    res.status(201).json(guest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update guest
router.put('/:id', auth, async (req, res) => {
  try {
    // First find the guest to verify ownership
    const existingGuest = await Guest.findById(req.params.id);
    if (!existingGuest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Verify the guest's invitation belongs to the logged-in user
    const invitation = await Invitation.findOne({ _id: existingGuest.invitationId, createdBy: req.user._id });
    if (!invitation) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(guest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update RSVP status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    // First find the guest to verify ownership
    const existingGuest = await Guest.findById(req.params.id);
    if (!existingGuest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Verify the guest's invitation belongs to the logged-in user
    const invitation = await Invitation.findOne({ _id: existingGuest.invitationId, createdBy: req.user._id });
    if (!invitation) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      { 
        rsvpStatus: req.body.rsvpStatus,
        respondedAt: new Date()
      },
      { new: true }
    ).populate('invitationId', 'title');
    
    res.json(guest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete guest
router.delete('/:id', auth, async (req, res) => {
  try {
    // First find the guest to verify ownership
    const existingGuest = await Guest.findById(req.params.id);
    if (!existingGuest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Verify the guest's invitation belongs to the logged-in user
    const invitation = await Invitation.findOne({ _id: existingGuest.invitationId, createdBy: req.user._id });
    if (!invitation) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    await Guest.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Guest deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
