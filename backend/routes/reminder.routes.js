/**
 * Reminder Routes for MapLeads CRM API
 * 
 * This file defines all routes related to reminder management.
 * 
 * @module routes/reminder.routes
 */

const express = require('express');
const router = express.Router();
const {
  createReminder,
  getAllReminders,
  getUpcomingReminders,
  getOverdueReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  markAsCompleted,
} = require('../controllers/reminderController');
const { authenticateToken, requireAdminOrAgent } = require('../middleware/authMiddleware');
const { validateReminder, validatePagination, validateDateRange } = require('../middleware/validationMiddleware');

/**
 * @route   POST /api/v1/reminders
 * @desc    Create a new reminder
 * @access  Private (Admin or Agent)
 */
router.post('/', authenticateToken, requireAdminOrAgent, validateReminder, createReminder);

/**
 * @route   GET /api/v1/reminders
 * @desc    Get all reminders for current user
 * @access  Private (Admin or Agent)
 */
router.get('/', authenticateToken, requireAdminOrAgent, validatePagination, getAllReminders);

/**
 * @route   GET /api/v1/reminders/upcoming
 * @desc    Get upcoming reminders
 * @access  Private (Admin or Agent)
 */
router.get('/upcoming', authenticateToken, requireAdminOrAgent, validateDateRange, getUpcomingReminders);

/**
 * @route   GET /api/v1/reminders/overdue
 * @desc    Get overdue reminders
 * @access  Private (Admin or Agent)
 */
router.get('/overdue', authenticateToken, requireAdminOrAgent, getOverdueReminders);

/**
 * @route   GET /api/v1/reminders/:id
 * @desc    Get single reminder by ID
 * @access  Private (Admin or Agent)
 */
router.get('/:id', authenticateToken, requireAdminOrAgent, getReminderById);

/**
 * @route   PUT /api/v1/reminders/:id
 * @desc    Update reminder
 * @access  Private (Admin or Agent)
 */
router.put('/:id', authenticateToken, requireAdminOrAgent, validateReminder, updateReminder);

/**
 * @route   DELETE /api/v1/reminders/:id
 * @desc    Delete reminder
 * @access  Private (Admin or Agent)
 */
router.delete('/:id', authenticateToken, requireAdminOrAgent, deleteReminder);

/**
 * @route   PUT /api/v1/reminders/:id/complete
 * @desc    Mark reminder as completed
 * @access  Private (Admin or Agent)
 */
router.put('/:id/complete', authenticateToken, requireAdminOrAgent, markAsCompleted);

module.exports = router;