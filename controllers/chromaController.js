import getCollection from '../config/chroma.js';

export const addNewDocument = async (request, response) => {
  try {
    const { documents, ids, metadatas } = request.body;

    const collection = await getCollection;
    
    await collection.add({
      ids,
      documents,
      metadatas
    });

    response.json({ 
      message: 'Documents added successfully',
      count: documents.length 
    });
    
  } catch (error) {
    response.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};