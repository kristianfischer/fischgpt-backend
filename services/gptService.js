import { Client } from '@gradio/client';
import { createFullPrompt } from '../config/systemPrompt.js';
import { performRAG } from './ragService.js';

const GRADIO_SPACE = 'kristianfischerai12345/fischgpt-api';

const DEFAULT_PARAMS = {
  temperature: 0.8,
  maxTokens: 300,
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

    const client = await Client.connect(GRADIO_SPACE);
    const result = await client.predict('/predict', {
      user_message: fullPrompt,
      temperature: params.temperature,
      max_length: params.maxTokens,
      top_p: params.topP
    });

    // Gradio predict returns { data } - data may be string or object depending on Space output
    const apiData = result?.data;
    if (apiData?.error) {
      console.error('❌ AI API returned error:', apiData.error);
      throw new Error(`AI API Error: ${apiData.error}`);
    }

    // Gradio often returns data as array of outputs (e.g. [assistantMessage])
    const raw = Array.isArray(apiData) ? apiData[0] : apiData;
    const responseText = typeof raw === 'string'
      ? raw
      : (raw?.response ?? raw?.data?.[0] ?? String(raw ?? ''));

    const out = {
      success: true,
      response: responseText,
      metadata: {
        ragUsed: ragContext.length > 0,
        contextLength: ragContext.length,
        promptLength: fullPrompt.length
      }
    };

    console.log('GPT Service: response', out.response);
    return out;
  } catch (error) {
    console.error('GPT Service Error:', error.message);

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('Request timeout - the AI service is taking too long to respond');
    }
    if (error.message?.startsWith('AI API Error:')) {
      throw error;
    }
    throw new Error('Unable to reach the AI service - please try again later');
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