import axios from 'axios';
import { createFullPrompt } from '../config/systemPrompt.js';
import { performRAG } from './ragService.js';

const AI_API_URL = 'https://kristianfischerai12345-fischgpt-api.hf.space/api/predict';

const DEFAULT_PARAMS = {
  temperature: 0.8,
  maxTokens: 400,
  topP: 0.9
};

async function generateResponse(query, options = {}) {
  try {

    const params = {
      temperature: options.temperature !== undefined ? options.temperature : DEFAULT_PARAMS.temperature,
      maxTokens: options.maxTokens !== undefined ? options.maxTokens : DEFAULT_PARAMS.maxTokens,
      topP: options.topP !== undefined ? options.topP : DEFAULT_PARAMS.topP
    };
    
    const ragContext = await performRAG(query, 5);
    
    const fullPrompt = createFullPrompt(query, ragContext);
    
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
      timeout: 90000,
    });

    const apiData = response.data.data && response.data.data[0] ? response.data.data[0] : response.data;

    if (apiData.error) {
      console.error('❌ AI API returned error:', apiData.error);
      throw new Error(`AI API Error: ${apiData.error}`);
    }

    const result = {
      success: true,
      response: apiData.response,
      metadata: {
        ...apiData.metadata,
        ragUsed: ragContext.length > 0,
        contextLength: ragContext.length,
        promptLength: fullPrompt.length
      }
    };

    console.log("GPT Service: response", result.response);
    
    return result;

  } catch (error) {
    console.error('GPT Service Error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - the AI service is taking too long to respond');
    }
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      throw new Error(`AI API returned ${error.response.status}: ${error.response.statusText}`);
    }
    
    if (error.request) {
      throw new Error('Unable to reach the AI service - please try again later');
    }
    
    throw error;
  }
}

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

export {
  generateResponse,
  checkServiceHealth,
  DEFAULT_PARAMS
}; 