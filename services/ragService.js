import getCollection from '../config/chroma.js';

/**
 * Search for relevant documents in ChromaDB based on query
 * @param {string} query - User's question
 * @param {number} nResults - Number of results to retrieve (default: 5)
 * @returns {Promise<Array>} - Array of relevant document objects
 */
export async function searchRelevantDocuments(query, nResults = 5) {
  try {
    console.log(`🔍 RAG: Searching for: "${query}"`);
    console.log(`🌍 RAG: Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 RAG: ChromaDB Config Check:`, {
      hasApiKey: !!process.env.CHROMA_API_KEY,
      hasTenant: !!process.env.CHROMA_TENANT,
      database: process.env.CHROMA_DATABASE || 'fischgpt'
    });
    
    const collection = await getCollection;
    console.log(`📂 RAG: Collection obtained: ${collection?.name || 'undefined'}`);
    
    const count = await collection.count();
    console.log(`📊 RAG: Collection has ${count} documents`);
    
    if (count === 0) {
      console.log('⚠️ RAG: No documents in collection - this might be the issue!');
      return [];
    }
    
    console.log(`🔎 RAG: Performing query with nResults=${nResults}`);
    const results = await collection.query({
      queryTexts: [query],
      nResults: nResults,
      include: ['documents', 'metadatas', 'distances']
    });

    console.log(`📋 RAG: Query results structure:`, {
      documentsLength: results.documents?.[0]?.length || 0,
      metadatasLength: results.metadatas?.[0]?.length || 0,
      distancesLength: results.distances?.[0]?.length || 0,
      hasDocuments: !!results.documents,
      hasMetadatas: !!results.metadatas,
      hasDistances: !!results.distances
    });

    const relevantDocs = [];
    
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        const distance = results.distances[0][i];
        
        console.log(`📄 RAG: Document ${i+1}: distance=${distance.toFixed(3)}, content="${results.documents[0][i]?.substring(0, 50)}..."`);
        
        // Accept documents with reasonable similarity (distance < 2.0)
        if (distance < 2.0) {
          relevantDocs.push({
            content: results.documents[0][i],
            metadata: results.metadatas[0][i],
            distance: distance
          });
          console.log(`✅ RAG: Document ${i+1} ACCEPTED`);
        } else {
          console.log(`❌ RAG: Document ${i+1} REJECTED (distance too high)`);
        }
      }
    } else {
      console.log('⚠️ RAG: No documents returned from query!');
    }

    console.log(`📄 RAG: Final result: ${relevantDocs.length} relevant documents`);
    
    // Sort by distance (lower = more relevant)
    relevantDocs.sort((a, b) => a.distance - b.distance);
    
    return relevantDocs;

  } catch (error) {
    console.error('❌ RAG: Search error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Check if it's a connection error
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      console.error('🌐 RAG: Network/connection error - check ChromaDB credentials and connectivity');
    }
    
    return [];
  }
}

/**
 * Format retrieved documents into natural context text
 * @param {Array} documents - Array of document objects from searchRelevantDocuments
 * @returns {string} - Formatted context text
 */
export function formatDocumentsAsContext(documents) {
  if (!documents || documents.length === 0) {
    console.log('📝 RAG: No documents to format - returning empty context');
    return '';
  }

  console.log(`📝 RAG: Formatting ${documents.length} documents into context`);
  let context = '';

  documents.forEach((doc, index) => {
    const section = doc.metadata.section;
    const subsection = doc.metadata.subsection;
    
    console.log(`📄 RAG: Formatting doc ${index+1}: section=${section}, subsection=${subsection}`);
    
    // Add section label for clarity
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
  console.log(`📝 RAG: Generated context length: ${finalContext.length} characters`);
  
  return finalContext;
}

/**
 * Perform RAG: retrieve relevant documents and format them as context
 * @param {string} query - User's question
 * @param {number} maxDocs - Maximum number of documents to retrieve
 * @returns {Promise<string>} - Formatted context string ready for prompt injection
 */
export async function performRAG(query, maxDocs = 5) {
  try {
    console.log(`🚀 RAG: Starting RAG process for query: "${query}"`);
    
    const relevantDocs = await searchRelevantDocuments(query, maxDocs);
    console.log(`🔍 RAG: Retrieved ${relevantDocs.length} documents`);
    
    const context = formatDocumentsAsContext(relevantDocs);
    console.log(`📝 RAG: Generated context: ${context.length} chars`);
    
    if (context.length === 0) {
      console.log('⚠️ RAG: WARNING - No context generated! RAG is not working.');
    } else {
      console.log(`✅ RAG: Successfully generated context for query`);
    }
    
    return context;
    
  } catch (error) {
    console.error('❌ RAG: Error performing RAG:', {
      message: error.message,
      stack: error.stack
    });
    return '';
  }
} 