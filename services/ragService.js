import getCollection from '../config/chroma.js';

export async function searchRelevantDocuments(query, nResults = 5) {
  try {
    
    const collection = await getCollection;
    const count = await collection.count();
    
    if (count === 0) {
      return [];
    }
    
    const results = await collection.query({
      queryTexts: [query],
      nResults: nResults,
      include: ['documents', 'metadatas', 'distances']
    });

    const relevantDocs = [];
    
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        const distance = results.distances[0][i];
        
        // Accept documents with reasonable similarity (distance < 2.0)
        if (distance < 2.0) {
          relevantDocs.push({
            content: results.documents[0][i],
            metadata: results.metadatas[0][i],
            distance: distance
          });
        }
      }
    }
    
    // Sort by distance (lower = more relevant)
    relevantDocs.sort((a, b) => a.distance - b.distance);
    
    return relevantDocs;

  } catch (error) {
    return [];
  }
}


export function formatDocumentsAsContext(documents) {
  if (!documents || documents.length === 0) {
    return '';
  }

  let context = '';

  documents.forEach(doc => {
    const section = doc.metadata.section;
    const subsection = doc.metadata.subsection;
    
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

  return context.trim();
}


export async function performRAG(query, maxDocs = 5) {
  try {
    const relevantDocs = await searchRelevantDocuments(query, maxDocs);
    const context = formatDocumentsAsContext(relevantDocs);
    
    return context;
    
  } catch (error) {
    console.error('RAG: Error performing RAG:', error.message);
    return '';
  }
} 