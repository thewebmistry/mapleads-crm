/**
 * MongoDB Database Configuration for MapLeads CRM
 * 
 * This module handles MongoDB connection using Mongoose ODM.
 * Includes connection retry logic, graceful shutdown, and status monitoring.
 * 
 * @module config/db
 */

const mongoose = require('mongoose');

// Connection configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds
let retryCount = 0;
let isConnected = false;

/**
 * Attempt to connect to MongoDB with retry logic
 * @returns {Promise} Mongoose connection promise
 */
const connectWithRetry = async () => {
  try {
    console.log(`🔌 Attempting MongoDB connection (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10, // Maximum number of connections in pool
    });

    isConnected = true;
    retryCount = 0;
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`📈 Ready State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    return conn;
  } catch (error) {
    retryCount++;
    
    console.error(`❌ MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}):`, error.message);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
      setTimeout(connectWithRetry, RETRY_DELAY_MS);
    } else {
      console.error('💥 Maximum retry attempts reached. Exiting process...');
      console.error('Please check:');
      console.error('1. MongoDB server is running');
      console.error('2. MONGODB_URI in .env is correct');
      console.error('3. Network connectivity');
      console.error('4. Firewall settings');
      
      process.exit(1);
    }
  }
};

/**
 * Connect to MongoDB database
 * @returns {Promise} Mongoose connection
 */
const connectDB = async () => {
  try {
    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
      isConnected = false;
      
      // Attempt reconnection
      if (retryCount < MAX_RETRIES) {
        console.log('Attempting to reconnect...');
        setTimeout(connectWithRetry, RETRY_DELAY_MS);
      }
    });

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
    });

    // Start connection
    return await connectWithRetry();
  } catch (error) {
    console.error(`❌ MongoDB connection setup failed: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Get MongoDB connection status
 * @returns {Object} Connection status
 */
const getDBStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  return {
    status: states[state] || 'unknown',
    readyState: state,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.connection.models),
    isConnected: isConnected,
    retryCount: retryCount,
    maxRetries: MAX_RETRIES,
  };
};

/**
 * Close MongoDB connection gracefully
 * @returns {Promise} Close connection promise
 */
const closeDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed successfully');
      isConnected = false;
      return true;
    }
    console.log('ℹ️ MongoDB connection already closed');
    return true;
  } catch (error) {
    console.error(`❌ Error closing MongoDB connection: ${error.message}`);
    return false;
  }
};

/**
 * Graceful shutdown handler
 */
const setupGracefulShutdown = () => {
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    try {
      // Close database connection
      await closeDB();
      console.log('✅ Database connections closed');
      
      // Exit process
      console.log('👋 Process terminated gracefully');
      process.exit(0);
    } catch (error) {
      console.error(`❌ Error during shutdown: ${error.message}`);
      process.exit(1);
    }
  };

  // Handle termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
  });
};

module.exports = {
  connectDB,
  getDBStatus,
  closeDB,
  setupGracefulShutdown,
  mongoose,
};