/**
 * Validation Middleware for MapLeads CRM
 * 
 * This middleware provides custom validation for request data
 * 
 * @module middleware/validationMiddleware
 */

/**
 * Validate lead creation/update data
 */
exports.validateLead = (req, res, next) => {
  const errors = [];
  const {
    businessName,
    ownerName,
    district,
    businessType,
    mapsLink,
    whatsapp,
    email,
    instagram,
    stage,
    status,
    budget,
    probability,
  } = req.body;

  // Required fields
  if (!businessName || businessName.trim() === '') {
    errors.push('Business name is required');
  }

  if (!ownerName || ownerName.trim() === '') {
    errors.push('Owner name is required');
  }

  if (!district || district.trim() === '') {
    errors.push('District is required');
  }

  // Business type validation
  const validBusinessTypes = ['restaurant', 'salon', 'gym', 'clinic', 'school', 'hotel', 'real_estate', 'coaching'];
  if (businessType && !validBusinessTypes.includes(businessType)) {
    errors.push(`Business type must be one of: ${validBusinessTypes.join(', ')}`);
  }

  // Maps link URL validation (optional)
  if (mapsLink && mapsLink.trim() !== '') {
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlRegex.test(mapsLink)) {
      errors.push('Maps link must be a valid URL');
    }
  }

  // WhatsApp validation (optional)
  if (whatsapp && whatsapp.trim() !== '') {
    const whatsappRegex = /^\+?[1-9]\d{1,14}$/;
    if (!whatsappRegex.test(whatsapp)) {
      errors.push('WhatsApp number must be in E.164 format (e.g., +1234567890)');
    }
  }

  // Email validation (optional)
  if (email && email.trim() !== '') {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email must be a valid email address');
    }
  }

  // Stage validation
  const validStages = ['new', 'contacted', 'replied', 'demo_sent', 'closed'];
  if (stage && !validStages.includes(stage)) {
    errors.push(`Stage must be one of: ${validStages.join(', ')}`);
  }

  // Status validation
  const validStatuses = ['hot', 'warm', 'cold'];
  if (status && !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Budget validation
  if (budget !== undefined && budget !== null) {
    const budgetNum = Number(budget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      errors.push('Budget must be a non-negative number');
    }
  }

  // Probability validation
  if (probability !== undefined && probability !== null) {
    const probNum = Number(probability);
    if (isNaN(probNum) || probNum < 0 || probNum > 100) {
      errors.push('Probability must be a number between 0 and 100');
    }
  }

  // Remark length validation
  if (req.body.remark && req.body.remark.length > 500) {
    errors.push('Remark cannot exceed 500 characters');
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
 * Validate user registration data
 */
exports.validateRegister = (req, res, next) => {
  const errors = [];
  const { name, email, password, role } = req.body;

  // Required fields
  if (!name || name.trim() === '') {
    errors.push('Name is required');
  }

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email must be a valid email address');
    }
  }

  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  // Role validation
  const validRoles = ['admin', 'agent'];
  if (role && !validRoles.includes(role)) {
    errors.push(`Role must be one of: ${validRoles.join(', ')}`);
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
 * Validate user login data
 */
exports.validateLogin = (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  }

  if (!password || password.trim() === '') {
    errors.push('Password is required');
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
 * Validate reminder creation/update data
 */
exports.validateReminder = (req, res, next) => {
  const errors = [];
  const { leadId, dueDate, message, priority } = req.body;

  // Required fields
  if (!leadId || leadId.trim() === '') {
    errors.push('Lead ID is required');
  }

  if (!dueDate) {
    errors.push('Due date is required');
  } else {
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) {
      errors.push('Due date must be a valid date');
    }
  }

  if (!message || message.trim() === '') {
    errors.push('Message is required');
  } else if (message.length > 500) {
    errors.push('Message cannot exceed 500 characters');
  }

  // Priority validation
  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
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
 * Validate project creation/update data
 */
exports.validateProject = (req, res, next) => {
  const errors = [];
  const { leadId, amount, paymentStatus, deliveryDate } = req.body;

  // Required fields
  if (!leadId || leadId.trim() === '') {
    errors.push('Lead ID is required');
  }

  if (!amount || amount === '') {
    errors.push('Amount is required');
  } else {
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum < 0) {
      errors.push('Amount must be a non-negative number');
    }
  }

  if (!deliveryDate) {
    errors.push('Delivery date is required');
  } else {
    const date = new Date(deliveryDate);
    if (isNaN(date.getTime())) {
      errors.push('Delivery date must be a valid date');
    }
  }

  // Payment status validation
  const validPaymentStatuses = ['pending', 'partial', 'paid', 'refunded'];
  if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
    errors.push(`Payment status must be one of: ${validPaymentStatuses.join(', ')}`);
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
 * Validate pagination parameters
 */
exports.validatePagination = (req, res, next) => {
  const errors = [];
  const { page, limit, sortOrder } = req.query;

  if (page) {
    const pageNum = Number(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive number');
    }
  }

  if (limit) {
    const limitNum = Number(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be a number between 1 and 100');
    }
  }

  if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
    errors.push('Sort order must be either "asc" or "desc"');
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
 * Validate date range parameters
 */
exports.validateDateRange = (req, res, next) => {
  const errors = [];
  const { startDate, endDate } = req.query;

  if (startDate) {
    const date = new Date(startDate);
    if (isNaN(date.getTime())) {
      errors.push('Start date must be a valid date');
    }
  }

  if (endDate) {
    const date = new Date(endDate);
    if (isNaN(date.getTime())) {
      errors.push('End date must be a valid date');
    }
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      errors.push('Start date cannot be after end date');
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
 * Generic validation error handler
 * This should be used after express-validator if we were using it
 */
exports.handleValidationErrors = (req, res, next) => {
  // This is a placeholder for express-validator integration
  // If using express-validator, we would check req.validationErrors() here
  next();
};