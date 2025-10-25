/**
 * Chat Routes - AI Agent API Endpoints
 * Defines routes for chat functionality
 */

const express = require('express');
const {
  sendMessage,
  getConversationHistory,
  clearConversationHistory,
  getAgentStats,
  healthCheck
} = require('../controllers/chatController');

const router = express.Router();

// Rate limiting for chat endpoints (prevent abuse)
const rateLimit = require('express-rate-limit');

const chatRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    error: 'Too many chat requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to chat endpoints
router.use(chatRateLimit);

/**
 * @route   POST /api/chat/message
 * @desc    Send message to AI agent
 * @access  Public (can be made private if needed)
 * @body    { message: string, sessionId?: string }
 */
router.post('/message', sendMessage);

/**
 * @route   GET /api/chat/history/:sessionId
 * @desc    Get conversation history for a session
 * @access  Public (can be made private if needed)
 */
router.get('/history/:sessionId', getConversationHistory);

/**
 * @route   DELETE /api/chat/history/:sessionId
 * @desc    Clear conversation history for a session
 * @access  Public (can be made private if needed)
 */
router.delete('/history/:sessionId', clearConversationHistory);

/**
 * @route   GET /api/chat/stats
 * @desc    Get AI agent statistics
 * @access  Public (can be made private if needed)
 */
router.get('/stats', getAgentStats);

/**
 * @route   GET /api/chat/health
 * @desc    Health check for AI agent service
 * @access  Public
 */
router.get('/health', healthCheck);

module.exports = router;
