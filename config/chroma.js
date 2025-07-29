import { CloudClient } from 'chromadb';
import dotenv from 'dotenv';

dotenv.config();

const client = new CloudClient({
	apiKey: process.env.CHROMA_API_KEY,
	tenant: process.env.CHROMA_TENANT,
	database: process.env.CHROMA_DATABASE || 'fischgpt',
});

const chromaCollectionPromise = client.getOrCreateCollection({
	name: process.env.CHROMA_DATABASE || 'fischgpt',
});

export default chromaCollectionPromise;