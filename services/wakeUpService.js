const axios = require('axios');
const { createFullPrompt } = require('../config/systemPrompt');

const AI_API_URL = 'https://kristianfischerai12345-fischgpt-api.hf.space/api/predict';

/**
 * Minimal wake-up parameters for GPU warm-up
 * Optimized for low cost and fast warm-up
 */
const WAKEUP_PARAMS = {
  temperature: 0.1,
  maxTokens: 250,  // Just enough for system prompt + minimal response
  topP: 0.1
};

/**
 * Wake up the AI service with a minimal request
 * This is designed to be called when the website loads to warm up the GPU
 * @returns {Promise<Object>} Wake-up result with timing information
 */
async function wakeUpService() {
  const startTime = Date.now();
  
  try {
    console.log('🌅 Waking up AI service...');
    
    // Use a minimal prompt to reduce token usage and cost
    const wakeUpPrompt = createFullPrompt("Hi");
    
    const requestBody = {
      data: [
        wakeUpPrompt,
        WAKEUP_PARAMS.temperature,
        WAKEUP_PARAMS.maxTokens,
        WAKEUP_PARAMS.topP
      ]
    };

    const response = await axios.post(AI_API_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 90000, // 90 second timeout for wake-up
    });

    const duration = Date.now() - startTime;
    
    // Handle the nested data structure from the AI API
    const apiData = response.data.data && response.data.data[0] ? response.data.data[0] : response.data;

    if (apiData.error) {
      console.warn('⚠️ Wake-up request had error, but service is responding:', apiData.error);
    }

    console.log(`✅ AI service wake-up completed in ${duration}ms`);
    
    return {
      success: true,
      wakeUpTime: duration,
      message: 'AI service is now warmed up and ready',
      metadata: apiData.metadata
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 Wake-up failed after ${duration}ms:`, error.message);
    
    return {
      success: false,
      wakeUpTime: duration,
      message: 'Wake-up failed, but this is non-critical',
      error: error.message
    };
  }
}

/**
 * Quick health check to see if service is already warmed up
 * @returns {Promise<boolean>} True if service responds quickly
 */
async function isServiceWarmedUp() {
  const startTime = Date.now();
  
  try {
    // Simple ping to check if service is responsive
    const response = await axios.post(AI_API_URL, {
      data: [
        createFullPrompt("Status"),
        0.1,
        250,
        0.1
      ]
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000 // Short timeout for quick check
    });

    const responseTime = Date.now() - startTime;
    
    // Consider warmed up if responds quickly (< 3 seconds)
    const isWarmed = responseTime < 3000;
    
    console.log(`🔍 Service response time: ${responseTime}ms (warmed up: ${isWarmed})`);
    
    return {
      isWarmed,
      responseTime,
      responding: true
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`❌ Service not responding: ${error.message} (${responseTime}ms)`);
    
    return {
      isWarmed: false,
      responseTime,
      responding: false,
      error: error.message
    };
  }
}

module.exports = {
  wakeUpService,
  isServiceWarmedUp,
  WAKEUP_PARAMS
}; 