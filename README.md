# FischGPT Backend

RAG-powered Express.js API that answers questions about Kristian Fischer using ChromaDB vector search and AI generation.

## Quick Start

```bash
npm install
npm run dev  # starts on http://localhost:3000
```

## Environment Setup

```bash
# .env
CHROMA_API_KEY=your_chroma_key
CHROMA_TENANT=your_tenant
CHROMA_DATABASE=fischgpt
```

## API Endpoints

### `POST /api/chat`
Chat with FischGPT about Kristian Fischer.

```json
{
  "query": "What programming languages does Kristian know?",
  "temperature": 0.8,    // optional
  "maxTokens": 400       // optional
}
```

### `POST /api/documents`
Upload resume documents to ChromaDB.

### `GET /api/health`
Service health check.

## Architecture

- **RAG Pipeline**: ChromaDB → Document Retrieval → Context Injection → AI Response
- **Vector Search**: Semantic search across resume documents
- **AI Integration**: Custom FischGPT model on Hugging Face
- **Document Management**: Structured resume data with metadata

## 📁 Structure

```
├── routes/          # API endpoints
├── services/        # RAG and AI services  
├── config/          # ChromaDB and prompt config
├── controllers/     # Document management
└── scripts/         # Data upload utilities
```

Built with Express.js, ChromaDB, and semantic search for precise, context-aware responses about Kristian Fischer's professional background. 