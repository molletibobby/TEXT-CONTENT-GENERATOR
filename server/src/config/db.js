const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB database instance
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/multimodal_studio', {
      serverSelectionTimeoutMS: 2000,
    });
    logger.success(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.warn(`MongoDB Connection Offline: Running in local in-memory studio mode (${error.message})`);
  }
};

module.exports = connectDB;
