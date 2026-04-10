const express = require('express');
const router = express.Router();
const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadStats,
} = require('../controllers/leadController');

// Validation middleware for lead creation/update
const validateLead = (req, res, next) => {
  const { businessName, ownerName, district, whatsapp, email } = req.body;

  // Required fields validation
  const errors = [];

  if (!businessName || businessName.trim() === '') {
    errors.push('Business name is required');
  }

  if (!ownerName || ownerName.trim() === '') {
    errors.push('Owner name is required');
  }

  if (!district || district.trim() === '') {
    errors.push('District is required');
  }

  if (!whatsapp || whatsapp.trim() === '') {
    errors.push('WhatsApp number is required');
  } else {
    // Basic WhatsApp validation (international format)
    const whatsappRegex = /^\+?[1-9]\d{1,14}$/;
    if (!whatsappRegex.test(whatsapp.replace(/\s/g, ''))) {
      errors.push('Please enter a valid WhatsApp number (international format)');
    }
  }

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors,
    });
  }

  next();
};

/**
 * @route   GET /api/v1/leads
 * @desc    Get all leads with filtering, sorting, and pagination
 * @access  Private
 */
router.get('/', getAllLeads);

/**
 * @route   GET /api/v1/leads/stats/summary
 * @desc    Get leads statistics summary
 * @access  Private
 */
router.get('/stats/summary', getLeadStats);

/**
 * @route   GET /api/v1/leads/:id
 * @desc    Get single lead by ID
 * @access  Private
 */
router.get('/:id', getLeadById);

/**
 * @route   POST /api/v1/leads
 * @desc    Create a new lead
 * @access  Private
 */
router.post('/', validateLead, createLead);

/**
 * @route   PUT /api/v1/leads/:id
 * @desc    Update a lead
 * @access  Private
 */
router.put('/:id', validateLead, updateLead);

/**
 * @route   PATCH /api/v1/leads/:id
 * @desc    Partially update a lead
 * @access  Private
 */
router.patch('/:id', updateLead);

/**
 * @route   DELETE /api/v1/leads/:id
 * @desc    Delete a lead
 * @access  Private
 */
router.delete('/:id', deleteLead);

module.exports = router;