import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction';
const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;


export async function getEmbeddings(text) {
  try {
    
    if (!HF_API_TOKEN) {
      throw new Error('HUGGINGFACE_API_TOKEN environment variable is required');
    }

    const response = await axios.post(HF_API_URL, {
      inputs: [text]
    }, {
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    const embeddings = response.data[0]; // HF returns array of arrays, we want the first one
    
    if (!Array.isArray(embeddings) || embeddings.length === 0) {
      throw new Error('Invalid embeddings response from Hugging Face API');
    }

    console.log(`Embeddings: Generated ${embeddings.length}-dimensional embedding`);
    return embeddings;

  } catch (error) {
    console.error('Embeddings: Error getting embeddings:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    throw error;
  }
} 