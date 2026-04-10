/**
 * Authentication Middleware for MapLeads CRM
 * 
 * This middleware handles JWT authentication and authorization.
 * It verifies tokens, attaches user data to requests, and protects routes.
 * 
 * @module middleware/authMiddleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Attach user data to request
    req.user = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    };
    
    // Continue to next middleware/route
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    let statusCode = 403;
    let errorMessage = 'Invalid token';
    let errorCode = 'INVALID_TOKEN';

    if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      errorMessage = 'Token has expired';
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 403;
      errorMessage = 'Malformed token';
      errorCode = 'MALFORMED_TOKEN';
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      code: errorCode,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {...String} allowedRoles - Roles permitted to access the route
 * @returns {Function} Middleware function
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: userRole
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user if token exists, but doesn't block if missing
 */
const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = {
          id: user._id,
          role: user.role,
          name: user.name,
          email: user.email
        };
      }
    } catch (error) {
      // Token is invalid but we don't block the request
      console.warn('⚠️ Optional authentication failed:', error.message);
    }
  }

  next();
};

/**
 * Middleware to check if user is admin
 * Shortcut for authorizeRoles('admin')
 */
const requireAdmin = authorizeRoles('admin');

/**
 * Middleware to check if user is admin or agent
 * Shortcut for authorizeRoles('admin', 'agent')
 */
const requireAdminOrAgent = authorizeRoles('admin', 'agent');

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuthenticate,
  requireAdmin,
  requireAdminOrAgent
};