const axios = require('axios');
const { createFullPrompt } = require('../config/systemPrompt');

const AI_API_URL = 'https://kristianfischerai12345-fischgpt-api.hf.space/api/predict';

/**
 * Default parameters for GPT requests
 */
const DEFAULT_PARAMS = {
  temperature: 0.8,
  maxTokens: 150,
  topP: 0.9
};

/**
 * Generates a response using the FischGPT model
 * @param {string} query - User's question about Kristian Fischer
 * @param {Object} options - Generation parameters
 * @param {number} options.temperature - Controls randomness (0.0-1.0), default 0.8
 * @param {number} options.maxTokens - Maximum tokens to generate, default 150
 * @param {number} options.topP - Controls diversity (0.0-1.0), default 0.9
 * @returns {Promise<Object>} API response with generated text and metadata
 */
async function generateResponse(query, options = {}) {
  try {
    // Merge options with defaults
    const params = { ...DEFAULT_PARAMS, ...options };
    
    // Create the full prompt with system context
    const fullPrompt = createFullPrompt(query);
    
    const requestBody = {
      data: [
        fullPrompt,
        params.temperature,
        params.maxTokens,
        params.topP
      ]
    };

    const response = await axios.post(AI_API_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 90000, // 90 second timeout
    });

    if (response.data.error) {
      throw new Error(`AI API Error: ${response.data.error}`);
    }

    return {
      success: true,
      response: response.data.response,
      metadata: response.data.metadata
    };

  } catch (error) {
    console.error('GPT Service Error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - the AI service is taking too long to respond');
    }
    
    if (error.response) {
      throw new Error(`AI API returned ${error.response.status}: ${error.response.statusText}`);
    }
    
    if (error.request) {
      throw new Error('Unable to reach the AI service - please try again later');
    }
    
    throw error;
  }
}

/**
 * Health check for the GPT service
 * @returns {Promise<boolean>} True if service is reachable
 */
async function checkServiceHealth() {
  try {
    const testResponse = await generateResponse("Hello", { 
      maxTokens: 10, 
      temperature: 0.1 
    });
    return testResponse.success;
  } catch (error) {
    console.error('GPT Service health check failed:', error.message);
    return false;
  }
}

module.exports = {
  generateResponse,
  checkServiceHealth,
  DEFAULT_PARAMS
}; 