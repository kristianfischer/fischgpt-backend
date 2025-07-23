const axios = require('axios');
const { createFullPrompt } = require('../config/systemPrompt');

const AI_API_URL = 'https://kristianfischerai12345-fischgpt-api.hf.space/api/predict';

/**
 * Default parameters for GPT requests
 * Note: maxTokens includes both input and output tokens
 */
const DEFAULT_PARAMS = {
  temperature: 0.8,
  maxTokens: 400,  // Increased to accommodate system prompt (~241 tokens) + response
  topP: 0.9
};

/**
 * Generates a response using the FischGPT model
 * @param {string} query - User's question about Kristian Fischer
 * @param {Object} options - Generation parameters
 * @param {number} options.temperature - Controls randomness (0.0-1.0), default 0.8
 * @param {number} options.maxTokens - Maximum tokens to generate, default 400
 * @param {number} options.topP - Controls diversity (0.0-1.0), default 0.9
 * @returns {Promise<Object>} API response with generated text and metadata
 */
async function generateResponse(query, options = {}) {
  try {
    // Ensure we always have valid numeric values by filtering out undefined
    const params = {
      temperature: options.temperature !== undefined ? options.temperature : DEFAULT_PARAMS.temperature,
      maxTokens: options.maxTokens !== undefined ? options.maxTokens : DEFAULT_PARAMS.maxTokens,
      topP: options.topP !== undefined ? options.topP : DEFAULT_PARAMS.topP
    };
    
    // Create the full prompt with system context
    const fullPrompt = createFullPrompt(query);
    
    console.log('🚀 Sending request to AI API...');
    console.log('📝 Full prompt length:', fullPrompt.length);
    console.log('⚙️ Parameters:', params);
    
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

    console.log('✅ AI API Response Status:', response.status);
    console.log('📦 Raw AI API Response:', JSON.stringify(response.data, null, 2));

    // Handle the nested data structure from the AI API
    const apiData = response.data.data && response.data.data[0] ? response.data.data[0] : response.data;

    if (apiData.error) {
      console.error('❌ AI API returned error:', apiData.error);
      throw new Error(`AI API Error: ${apiData.error}`);
    }

    const result = {
      success: true,
      response: apiData.response,
      metadata: apiData.metadata
    };

    console.log('🎯 Processed result:', JSON.stringify(result, null, 2));
    return result;

  } catch (error) {
    console.error('💥 GPT Service Error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - the AI service is taking too long to respond');
    }
    
    if (error.response) {
      console.error('📋 Error response data:', error.response.data);
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
      maxTokens: 300, 
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