/**
 * Payment Routes for MapLeads CRM API
 * 
 * This file defines all routes related to payment management.
 * Includes CRUD operations, filtering, sorting, pagination, and statistics.
 * 
 * @module routes/payment.routes
 */

const express = require('express');
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentStats,
} = require('../controllers/paymentController');
const { authenticateToken, requireAdminOrAgent } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/v1/payments
 * @desc    Create a new payment
 * @access  Private (Admin or Agent)
 */
router.post('/', authenticateToken, requireAdminOrAgent, createPayment);

/**
 * @route   GET /api/v1/payments
 * @desc    Get all payments with filtering, sorting, and pagination
 * @access  Private (Admin or Agent)
 */
router.get('/', authenticateToken, requireAdminOrAgent, getAllPayments);

/**
 * @route   GET /api/v1/payments/stats/summary
 * @desc    Get payment statistics
 * @access  Private (Admin or Agent)
 */
router.get('/stats/summary', authenticateToken, requireAdminOrAgent, getPaymentStats);

/**
 * @route   GET /api/v1/payments/:id
 * @desc    Get single payment by ID
 * @access  Private (Admin or Agent)
 */
router.get('/:id', authenticateToken, requireAdminOrAgent, getPaymentById);

/**
 * @route   PUT /api/v1/payments/:id
 * @desc    Update payment
 * @access  Private (Admin or Agent)
 */
router.put('/:id', authenticateToken, requireAdminOrAgent, updatePayment);

/**
 * @route   DELETE /api/v1/payments/:id
 * @desc    Delete payment (soft delete by archiving)
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticateToken, requireAdminOrAgent, deletePayment);

module.exports = router;