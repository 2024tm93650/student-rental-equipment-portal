const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./config/db'); // Enable MongoDB connection

console.log('🚀 Starting School Equipment Portal API...');
console.log('📊 Connecting to MongoDB Atlas (Free Tier)...');

// Connect to MongoDB Atlas
connectDB();

// Import routes (using real MongoDB controllers)
const authRoutes = require('./routes/auth');
const equipmentRoutes = require('./routes/equipment');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/auth'); // User management is part of auth routes

// Create Express app
const app = express();

// Mock Database Connection (Skip MongoDB)
// connectDB(); // Temporarily disabled for testing

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'School Equipment Portal API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint to check connectivity
app.post('/api/test', (req, res) => {
  console.log('🧪 Test endpoint hit:', req.body);
  res.json({
    success: true,
    message: 'Test endpoint working',
    receivedData: req.body
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests', requestRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'School Equipment Portal API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile (requires auth)',
        'PUT /api/auth/profile': 'Update user profile (requires auth)',
        'GET /api/auth/users': 'Get all users (admin only)'
      },
      equipment: {
        'GET /api/equipment': 'Get all equipment (with optional filters)',
        'GET /api/equipment/categories': 'Get equipment categories',
        'GET /api/equipment/stats': 'Get equipment statistics (staff/admin)',
        'GET /api/equipment/:id': 'Get equipment by ID',
        'POST /api/equipment': 'Create new equipment (staff/admin)',
        'PUT /api/equipment/:id': 'Update equipment (staff/admin)',
        'DELETE /api/equipment/:id': 'Delete equipment (admin only)'
      },
      requests: {
        'GET /api/requests': 'Get all requests (filtered by role)',
        'GET /api/requests/stats': 'Get request statistics (staff/admin)',
        'GET /api/requests/:id': 'Get request by ID',
        'POST /api/requests': 'Create new request',
        'PUT /api/requests/:id/approve': 'Approve request (staff/admin)',
        'PUT /api/requests/:id/reject': 'Reject request (staff/admin)',
        'PUT /api/requests/:id/borrowed': 'Mark as borrowed (staff/admin)',
        'PUT /api/requests/:id/returned': 'Mark as returned (staff/admin)'
      }
    }
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 3001;
console.log(`Attempting to start server on port: ${PORT}`);
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;