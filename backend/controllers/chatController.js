/**
 * Chat Controller - AI Agent API Endpoints
 * Handles chat interactions with the AI agent
 */

const aiAgentService = require('../services/aiAgentService');
const { AppError } = require('../middleware/errorHandler');

/**
 * Send message to AI agent
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return next(new AppError('Message is required and must be a non-empty string', 400));
    }
    
    if (message.length > 1000) {
      return next(new AppError('Message is too long. Maximum 1000 characters allowed.', 400));
    }
    
    // Process message with AI agent
    const result = await aiAgentService.processMessage(message.trim(), sessionId);
    
    if (!result.success) {
      return next(new AppError(result.error || 'Failed to process message', 500));
    }
    
    res.status(200).json({
      success: true,
      data: {
        response: result.response,
        sessionId: result.sessionId,
        context: result.context,
        solutionCards: result.solutionCards,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error in sendMessage:', error);
    next(new AppError('Internal server error while processing message', 500));
  }
};

/**
 * Get conversation history for a session
 */
const getConversationHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return next(new AppError('Session ID is required', 400));
    }
    
    const history = aiAgentService.getConversationHistory(sessionId);
    
    res.status(200).json({
      success: true,
      data: {
        sessionId: sessionId,
        history: history,
        messageCount: history.length
      }
    });
    
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    next(new AppError('Internal server error while fetching conversation history', 500));
  }
};

/**
 * Clear conversation history for a session
 */
const clearConversationHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return next(new AppError('Session ID is required', 400));
    }
    
    const result = aiAgentService.clearConversationHistory(sessionId);
    
    res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error in clearConversationHistory:', error);
    next(new AppError('Internal server error while clearing conversation history', 500));
  }
};

/**
 * Get AI agent statistics
 */
const getAgentStats = async (req, res, next) => {
  try {
    const stats = aiAgentService.getStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error in getAgentStats:', error);
    next(new AppError('Internal server error while fetching agent statistics', 500));
  }
};

/**
 * Health check for AI agent service
 */
const healthCheck = async (req, res, next) => {
  try {
    // Test OpenAI connection with a simple request
    const testMessage = "Hello, are you working?";
    const result = await aiAgentService.processMessage(testMessage);
    
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        aiAgent: result.success ? 'operational' : 'error',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
    
  } catch (error) {
    console.error('Error in healthCheck:', error);
    res.status(503).json({
      success: false,
      error: 'AI agent service unavailable',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  sendMessage,
  getConversationHistory,
  clearConversationHistory,
  getAgentStats,
  healthCheck
};
