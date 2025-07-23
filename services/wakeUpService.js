const axios = require('axios');

const WAKEUP_API_URL = 'https://kristianfischerai12345-fischgpt-api.hf.space/api/wake-up';

async function wakeUpService() {
  try {
    
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