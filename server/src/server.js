const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Ensure uploads and processed directories exist
const uploadDir = path.join(__dirname, '../uploads');
const processedDir = path.join(__dirname, '../processed');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

// Core Security & Middleware
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static Folders for File Access
app.use('/uploads', express.static(uploadDir));
app.use('/processed', express.static(processedDir));

// System Health & AI Engine Diagnostics API
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AI Multimodal Content Studio API is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Import API Routers
const authRoutes = require('./routes/auth.routes');
const mediaRoutes = require('./routes/media.routes');

// Mount API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/media', mediaRoutes);


// Catch Unknown Routes (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Register Global Error Middleware
app.use(errorHandler);

// Start HTTP Server
const server = app.listen(PORT, () => {
  logger.success(`🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle Unhandled Rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});
