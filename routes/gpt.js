const express = require('express');
const router = express.Router();
const { generateResponse } = require('../services/gptService');

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
    
    console.log(`FischGPT chat request: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);
    
    const result = await generateResponse(query, {
      temperature,
      maxTokens,
      topP
    });
    
    res.json({
      success: true,
      data: {
        response: result.response,
        metadata: result.metadata
      }
    });
    
  } catch (error) {
    console.error('FischGPT chat endpoint error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate response',
      message: error.message
    });
  }
});

module.exports = router; 