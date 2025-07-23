const axios = require('axios');

const WAKEUP_API_URL = 'https://kristianfischerai12345-fischgpt-api.hf.space/api/wake-up';

/**
 * Wake up the AI service using the dedicated wake-up endpoint
 * This is designed to be called when the website loads to warm up the GPU
 * @returns {Promise<Object>} Wake-up result with timing information
 */
async function wakeUpService() {
  try {
    console.log('🌅 Waking up AI service using dedicated endpoint...');
    
    const response = await axios.post(WAKEUP_API_URL, {data: []}, {
      timeout: 90000,
    });

    console.log('Wake-up response:', response.data);
    
    return {
      success: true,
      wakeUpTime: response.data.duration,
      message: 'AI service is now warmed up and ready',
      status: response.data.data[0].status,
      endpoint: 'dedicated wake-up endpoint'
    };

  } catch (error) {
    return {
      success: false,
      message: 'Wake-up failed, but this is non-critical',
      error: error.message,
      endpoint: 'dedicated wake-up endpoint'
    };
  }
}

module.exports = {
  wakeUpService,
}; 