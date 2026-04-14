/**
 * Lead Routes for MapLeads CRM API
 * 
 * This file defines all routes related to lead management.
 * Includes CRUD operations, filtering, sorting, pagination, and statistics.
 * 
 * @module routes/lead.routes
 */

const express = require('express');
const router = express.Router();
const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadStats,
  getLeadsWithFollowUps,
  bulkUpdateLeads,
  getDashboardKPI,
} = require('../controllers/leadController');
const { authenticateToken, requireAdminOrAgent } = require('../middleware/authMiddleware');
const { validateLead, validatePagination } = require('../middleware/validationMiddleware');

/**
 * @route   POST /api/v1/leads
 * @desc    Create a new lead
 * @access  Private (Admin or Agent)
 */
router.post('/', validateLead, createLead);

/**
 * @route   GET /api/v1/leads
 * @desc    Get all leads with filtering, sorting, and pagination
 * @access  Private (Admin or Agent)
 */
router.get('/', validatePagination, getAllLeads);

/**
 * @route   GET /api/v1/leads/stats/summary
 * @desc    Get lead statistics
 * @access  Private (Admin or Agent)
 */
router.get('/stats/summary', authenticateToken, requireAdminOrAgent, getLeadStats);

/**
 * @route   GET /api/v1/leads/dashboard/kpi
 * @desc    Get dashboard KPI metrics
 * @access  Private (Admin or Agent)
 */
router.get('/dashboard/kpi', authenticateToken, requireAdminOrAgent, getDashboardKPI);

/**
 * @route   GET /api/v1/leads/follow-ups
 * @desc    Get leads with upcoming follow-ups
 * @access  Private (Admin or Agent)
 */
router.get('/follow-ups', authenticateToken, requireAdminOrAgent, getLeadsWithFollowUps);

/**
 * @route   GET /api/v1/leads/:id
 * @desc    Get single lead by ID
 * @access  Private (Admin or Agent)
 */
router.get('/:id', authenticateToken, requireAdminOrAgent, getLeadById);

/**
 * @route   PUT /api/v1/leads/:id
 * @desc    Update lead
 * @access  Private (Admin or Agent)
 */
router.put('/:id', authenticateToken, requireAdminOrAgent, validateLead, updateLead);

/**
 * @route   DELETE /api/v1/leads/:id
 * @desc    Delete lead (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticateToken, requireAdminOrAgent, deleteLead);

/**
 * @route   PUT /api/v1/leads/bulk
 * @desc    Bulk update leads
 * @access  Private (Admin only)
 */
router.put('/bulk', authenticateToken, requireAdminOrAgent, bulkUpdateLeads);

module.exports = router;