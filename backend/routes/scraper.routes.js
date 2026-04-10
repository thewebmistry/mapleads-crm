/**
 * Scraper Routes for MapLeads CRM API
 * 
 * This file defines all routes related to web scraping operations.
 * Includes Google Maps search and business data extraction.
 * 
 * @module routes/scraper.routes
 */

const express = require('express');
const router = express.Router();
const {
  mapsSearch,
  testScraper,
  getScraperStats,
} = require('../controllers/scraperController');
const { authenticateToken, requireAdminOrAgent } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/v1/scraper/maps-search
 * @desc    Search for businesses on Google Maps
 * @access  Private (Admin or Agent)
 * @param   {string} city - City to search in
 * @param   {string} category - Business category/type
 * @param   {number} limit - Maximum number of results to return
 * @returns {Object} JSON array of business listings
 */
router.post('/maps-search', authenticateToken, requireAdminOrAgent, mapsSearch);

/**
 * @route   POST /api/v1/scraper/maps-search/public
 * @desc    Search for businesses on Google Maps (public test endpoint)
 * @access  Public
 * @param   {string} city - City to search in
 * @param   {string} category - Business category/type
 * @param   {number} limit - Maximum number of results to return
 * @returns {Object} JSON array of business listings
 */
router.post('/maps-search/public', mapsSearch);

/**
 * @route   GET /api/v1/scraper/test
 * @desc    Test scraper connection and service status
 * @access  Private (Admin or Agent)
 * @returns {Object} Scraper service status information
 */
router.get('/test', authenticateToken, requireAdminOrAgent, testScraper);

/**
 * @route   GET /api/v1/scraper/stats
 * @desc    Get scraper usage statistics
 * @access  Private (Admin only)
 * @returns {Object} Scraper statistics and performance metrics
 */
router.get('/stats', authenticateToken, requireAdminOrAgent, getScraperStats);

module.exports = router;