const express = require('express');
const router = express.Router();
const { generateResponse, checkServiceHealth } = require('../services/gptService');
const { getEstimatedTokenCount } = require('../config/systemPrompt');

/**
 * Validates chat request parameters
 * @param {Object} body - Request body
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateChatRequest(body) {
  const errors = [];
  
  if (!body.query || typeof body.query !== 'string' || body.query.trim().length === 0) {
    errors.push('Query is required and must be a non-empty string');
  }
  
  if (body.query && body.query.length > 500) {
    errors.push('Query must be less than 500 characters');
  }
  
  if (body.temperature !== undefined) {
    if (typeof body.temperature !== 'number' || body.temperature < 0 || body.temperature > 1) {
      errors.push('Temperature must be a number between 0 and 1');
    }
  }
  
  if (body.maxTokens !== undefined) {
    if (!Number.isInteger(body.maxTokens) || body.maxTokens < 1 || body.maxTokens > 300) {
      errors.push('Max tokens must be an integer between 1 and 300');
    }
  }
  
  if (body.topP !== undefined) {
    if (typeof body.topP !== 'number' || body.topP < 0 || body.topP > 1) {
      errors.push('Top P must be a number between 0 and 1');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * POST /api/chat
 * Generates a response to a user query about Kristian Fischer
 * 
 * Request body:
 * {
 *   "query": "What experience does Kristian have?",
 *   "temperature": 0.8,     // optional, 0.0-1.0
 *   "maxTokens": 150,       // optional, 1-300
 *   "topP": 0.9            // optional, 0.0-1.0
 * }
 */
router.post('/chat', async (req, res) => {
  try {
    // Validate request
    const validation = validateChatRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: validation.errors
      });
    }
    
    const { query, temperature, maxTokens, topP } = req.body;
    
    // Log the request (helpful for monitoring)
    console.log(`FischGPT chat request: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);
    
    // Generate response using GPT service
    const result = await generateResponse(query, {
      temperature,
      maxTokens,
      topP
    });
    
    // Return successful response
    res.json({
      success: true,
      data: {
        response: result.response,
        metadata: result.metadata
      }
    });
    
  } catch (error) {
    console.error('FischGPT chat endpoint error:', error.message);
    
    // Return appropriate error response
    res.status(500).json({
      success: false,
      error: 'Failed to generate response',
      message: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint with GPT service status
 */
router.get('/health', async (req, res) => {
  try {
    const gptServiceHealthy = await checkServiceHealth();
    const systemPromptTokens = getEstimatedTokenCount();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'FischGPT Backend',
      gptService: {
        status: gptServiceHealthy ? 'healthy' : 'unhealthy',
        systemPromptTokens: systemPromptTokens
      }
    });
  } catch (error) {
    console.error('Health check error:', error.message);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'FischGPT Backend',
      error: error.message
    });
  }
});

/**
 * GET /api/info
 * Get information about the FischGPT system
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    service: 'FischGPT Backend',
    description: 'AI assistant for questions about Kristian Fischer',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat - Generate responses about Kristian Fischer',
      health: 'GET /api/health - Service health check',
      info: 'GET /api/info - Service information'
    },
    systemPrompt: {
      estimatedTokens: getEstimatedTokenCount(),
      description: 'Optimized prompt about Kristian Fischer\'s background and expertise'
    }
  });
});

module.exports = router; 