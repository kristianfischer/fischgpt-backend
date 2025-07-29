import axios from 'axios';
import dotenv from 'dotenv';
import { getEmbeddings } from './embeddingService.js';

dotenv.config();

const CHROMA_API_BASE = `https://api.trychroma.com/api/v2/tenants/${process.env.CHROMA_TENANT_ID}/databases/${process.env.CHROMA_DATABASE}/collections/${process.env.CHROMA_COLLECTION}`;
const CHROMA_API_TOKEN = process.env.CHROMA_API_TOKEN;


export async function searchRelevantDocuments(query, nResults = 5) {
  try {

    if (!CHROMA_API_TOKEN || !process.env.CHROMA_TENANT_ID) {
      throw new Error('Missing required ChromaDB configuration');
    }

    const queryEmbeddings = await getEmbeddings(query);
    
    const response = await axios.post(`${CHROMA_API_BASE}/query`, {
      query_embeddings: [queryEmbeddings],
      n_results: nResults,
      include: ["documents", "metadatas", "distances"]
    }, {
      headers: {
        'X-Chroma-Token': CHROMA_API_TOKEN,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const results = response.data;

    console.log("Documents: retrieved", results.documents[0].length, "documents");

    const relevantDocs = [];
    
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        const distance = results.distances[0][i];
        
        if (distance < 2.0) {
          relevantDocs.push({
            content: results.documents[0][i],
            metadata: results.metadatas[0][i],
            distance: distance
          });
        } 
      }
    }
    
    relevantDocs.sort((a, b) => a.distance - b.distance);
    
    return relevantDocs;

  } catch (error) {
    console.error('RAG: Search error details:', error.message);
    return [];
  }
}

export function formatDocumentsAsContext(documents) {
  if (!documents || documents.length === 0) {
    return '';
  }

  let context = '';

  documents.forEach((doc, index) => {
    const section = doc.metadata.section;
    const subsection = doc.metadata.subsection;
    
    if (section === 'skills') {
      context += `${subsection}: ${doc.content}\n`;
    } else if (section === 'experience') {
      context += `Work Experience: ${doc.content}`;
      if (doc.metadata.company) {
        context += ` (at ${doc.metadata.company})`;
      }
      context += '\n';
    } else if (section === 'projects') {
      context += `Project: ${doc.content}`;
      if (doc.metadata.project_name) {
        context += ` (${doc.metadata.project_name})`;
      }
      context += '\n';
    } else if (section === 'education') {
      context += `Education: ${doc.content}\n`;
    } else if (section === 'contact') {
      context += `Contact: ${doc.content}\n`;
    } else {
      context += `${doc.content}\n`;
    }
  });

  const finalContext = context.trim();
  
  return finalContext;
}

export async function performRAG(query, maxDocs = 5) {
  try {
    
    const relevantDocs = await searchRelevantDocuments(query, maxDocs);
    
    const context = formatDocumentsAsContext(relevantDocs);
    
    if (context.length === 0) {
      console.log('RAG: WARNING - No context generated! RAG is not working.');
    } else {
      console.log(`RAG: Successfully generated context for query`);
    }
    
    return context;
    
  } catch (error) {
    console.error('RAG: Error performing RAG:', error.message);
    return '';
  }
} 