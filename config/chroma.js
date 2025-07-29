import { CloudClient } from 'chromadb';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 ChromaDB: Initializing client...');
console.log('🔑 ChromaDB: Environment check:', {
  hasApiKey: !!process.env.CHROMA_API_KEY,
  apiKeyLength: process.env.CHROMA_API_KEY?.length || 0,
  hasTenant: !!process.env.CHROMA_TENANT,
  tenantValue: process.env.CHROMA_TENANT ? 'set' : 'not set',
  database: process.env.CHROMA_DATABASE || 'fischgpt',
  nodeEnv: process.env.NODE_ENV || 'development'
});

const client = new CloudClient({
	apiKey: process.env.CHROMA_API_KEY,
	tenant: process.env.CHROMA_TENANT,
	database: process.env.CHROMA_DATABASE || 'fischgpt',
});

console.log('📡 ChromaDB: Client created successfully');

const chromaCollectionPromise = client.getOrCreateCollection({
	name: process.env.CHROMA_DATABASE || 'fischgpt',
}).then(collection => {
	console.log(`✅ ChromaDB: Collection "${collection.name}" obtained successfully`);
	return collection;
}).catch(error => {
	console.error('❌ ChromaDB: Failed to get/create collection:', {
		message: error.message,
		stack: error.stack,
		name: error.name
	});
	throw error;
});

export default chromaCollectionPromise;