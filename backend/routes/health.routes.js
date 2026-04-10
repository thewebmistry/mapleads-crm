const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/db');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = getDBStatus();
  
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: process.env.APP_NAME || 'MapLeads CRM',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    database: {
      status: dbStatus.status,
      host: dbStatus.host,
      name: dbStatus.name,
      models: dbStatus.models,
    },
    memory: process.memoryUsage(),
  });
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with system info
 * @access  Public
 */
router.get('/detailed', (req, res) => {
  const dbStatus = getDBStatus();
  
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: process.env.APP_NAME || 'MapLeads CRM',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    },
    database: {
      status: dbStatus.status,
      readyState: dbStatus.readyState,
      host: dbStatus.host,
      name: dbStatus.name,
      models: dbStatus.models,
    },
    system: {
      cpus: require('os').cpus().length,
      totalmem: require('os').totalmem(),
      freemem: require('os').freemem(),
      loadavg: require('os').loadavg(),
    },
  });
});

/**
 * @route   GET /api/health/readiness
 * @desc    Readiness probe for Kubernetes/containers
 * @access  Public
 */
router.get('/readiness', (req, res) => {
  const dbStatus = getDBStatus();
  const isReady = dbStatus.readyState === 1; // 1 = connected
  
  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      readyState: dbStatus.readyState,
    });
  }
});

/**
 * @route   GET /api/health/liveness
 * @desc    Liveness probe for Kubernetes/containers
 * @access  Public
 */
router.get('/liveness', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;