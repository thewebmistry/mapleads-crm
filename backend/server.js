require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB, getDBStatus } = require('./config/db');

// Initialize Express app
const app = express();

// ======================
// Environment Variables
// ======================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_VERSION = process.env.API_VERSION || 'v1';

// ======================
// Middleware
// ======================

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  // Production frontend
  'https://mapleads-frontend.onrender.com',
  // Development origins
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'null'
];

// Add CLIENT_URL from environment if provided
if (process.env.CLIENT_URL) {
  const clientUrls = process.env.CLIENT_URL.split(',').map(url => url.trim());
  clientUrls.forEach(url => {
    if (!allowedOrigins.includes(url)) {
      allowedOrigins.push(url);
    }
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log blocked origins for debugging
      console.warn(`CORS blocked: ${origin} not in allowed origins`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours for preflight cache
};
app.use(cors(corsOptions));

// Request logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// Static File Serving (Frontend)
// ======================
app.use(express.static('frontend'));
app.use('/assets', express.static('frontend/assets'));

// ======================
// Import Routes
// ======================
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const leadRoutes = require('./routes/lead.routes');
const reminderRoutes = require('./routes/reminder.routes');
const paymentRoutes = require('./routes/payment.routes');

// ======================
// API Routes
// ======================

// Health routes (versioned)
app.use(`/api/${API_VERSION}/health`, healthRoutes);

// Authentication routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);

// Lead routes
app.use(`/api/${API_VERSION}/leads`, leadRoutes);

// Reminder routes
app.use(`/api/${API_VERSION}/reminders`, reminderRoutes);


// Payment routes
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);

// API root
app.get(`/api/${API_VERSION}`, (req, res) => {
  res.json({
    message: `Welcome to ${process.env.APP_NAME || 'MapLeads CRM'} API`,
    version: API_VERSION,
    documentation: '/api/docs', // Future documentation endpoint
    endpoints: {
      health: '/api/health',
      'health-detailed': '/api/health/detailed',
      'health-readiness': '/api/health/readiness',
      'health-liveness': '/api/health/liveness',
      auth: `/api/${API_VERSION}/auth`,
      leads: `/api/${API_VERSION}/leads`,
      'leads-stats': `/api/${API_VERSION}/leads/stats/summary`,
      'leads-follow-ups': `/api/${API_VERSION}/leads/follow-ups`,
      reminders: `/api/${API_VERSION}/reminders`,
      payments: `/api/${API_VERSION}/payments`,
      'payments-stats': `/api/${API_VERSION}/payments/stats/summary`,
      users: `/api/${API_VERSION}/users`,
    },
  });
});

// ======================
// Error Handling Middleware
// ======================

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// ======================
// Server Startup
// ======================
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode`);
      console.log(`📡 API: http://localhost:${PORT}/api/${API_VERSION}`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        // Close database connections if needed
        // await closeDB();
        
        console.log('Process terminated');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;