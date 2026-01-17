/**
 * AI Solutions Marketplace - Backend Server
 * Main server file that sets up Express app, middleware, and routes
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { globalErrorHandler, handleNotFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const solutionRoutes = require('./routes/solutions');
const queryRoutes = require('./routes/queries');
const chatRoutes = require('./routes/chat');
const institutionRoutes = require('./routes/institutions');
const vendorRoutes = require('./routes/vendors');
const userRoutes = require('./routes/user');
const automationRoutes = require('./routes/automation');
const proposalRoutes = require('./routes/proposals');
const dataFieldsRoutes = require('./routes/dataFields');

// Initialize Express app
const app = express();

// Connect to MongoDB Atlas
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_solutions_marketplace';
console.log('🔗 Connecting to MongoDB Atlas...');
console.log('📍 Database:', mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB');
connectDB(mongoURI);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3001', // Allow Next.js dev server on port 3001
    'http://localhost:3000'  // Allow Next.js dev server on port 3000
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Solutions Marketplace API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/companies', require('./routes/companies'));
app.use('/api/institution', institutionRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/data-fields', dataFieldsRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Solutions Marketplace API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'PUT /api/auth/change-password': 'Change password',
        'POST /api/auth/logout': 'Logout user'
      },
      solutions: {
        'GET /api/solutions': 'Get all solutions',
        'GET /api/solutions/featured': 'Get featured solutions',
        'GET /api/solutions/search': 'Search solutions',
        'GET /api/solutions/recommendations': 'Get recommendations',
        'GET /api/solutions/:id': 'Get solution by ID',
        'POST /api/solutions': 'Create solution (vendors only)',
        'PUT /api/solutions/:id': 'Update solution',
        'DELETE /api/solutions/:id': 'Delete solution'
      },
      queries: {
        'GET /api/queries': 'Get queries',
        'GET /api/queries/active': 'Get active public queries',
        'GET /api/queries/:id': 'Get query by ID',
        'POST /api/queries': 'Create query (customers only)',
        'PUT /api/queries/:id': 'Update query',
        'DELETE /api/queries/:id': 'Delete query',
        'POST /api/queries/:id/resolve': 'Resolve query'
      },
      chat: {
        'POST /api/chat/message': 'Send message to AI agent',
        'GET /api/chat/history/:sessionId': 'Get conversation history',
        'DELETE /api/chat/history/:sessionId': 'Clear conversation history',
        'GET /api/chat/stats': 'Get AI agent statistics',
        'GET /api/chat/health': 'AI agent health check'
      }
    }
  });
});

// Handle undefined routes
app.use(handleNotFound);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📱 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
