# FischGPT Backend

A Node.js/Express.js backend API for FischGPT - an AI assistant that answers questions about Kristian Fischer's professional background, skills, and experiences.

## Features

- **RESTful API** for chat interactions with FischGPT
- **Input validation** and error handling
- **CORS configuration** for frontend integration
- **Health check endpoint** for monitoring
- **Clean, modular architecture** with separated concerns

## API Endpoints

### POST /api/chat

Generate a response to questions about Kristian Fischer.

**Request Body:**
```json
{
  "query": "What experience does Kristian have with machine learning?",
  "temperature": 0.8,    // optional: 0.0-1.0, controls randomness
  "maxTokens": 150,      // optional: 1-300, max response length
  "topP": 0.9           // optional: 0.0-1.0, controls diversity
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Kristian Fischer has extensive experience in machine learning...",
    "metadata": {
      "input_tokens": 245,
      "output_tokens": 87,
      "new_tokens": 87,
      "generation_time": 1.234,
      "tokens_per_second": 70.6,
      "model": "FischGPT-SFT",
      "parameters": {
        "temperature": 0.8,
        "max_length": 150,
        "top_p": 0.9
      }
    }
  }
}
```

### GET /api/health

Health check endpoint for monitoring service status.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "FischGPT Backend"
}
```

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fischgpt-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000` by default.

## Project Structure

```
fischgpt-backend/
├── routes/
│   ├── api.js          # API endpoints for chat functionality
│   ├── index.js        # Legacy web routes
│   └── users.js        # Legacy user routes
├── services/
│   └── aiService.js    # AI model communication service
├── app.js              # Express app configuration
├── package.json        # Dependencies and scripts
└── .env.example        # Environment variables template
```

## Architecture

- **Modular Design**: Services are separated from routes for better maintainability
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Input Validation**: Request validation to ensure data integrity
- **CORS Support**: Configured for cross-origin requests from frontend applications
- **Environment Configuration**: Flexible configuration through environment variables

## Development

The backend is designed to be lightweight and focused solely on its core functionality: bridging the frontend with the FischGPT AI model. It follows Express.js best practices and maintains clean, readable code suitable for review by potential employers.

## External Dependencies

- **AI Model**: Communicates with FischGPT model hosted at Hugging Face Spaces
- **Frontend**: Designed to work with a React/Next.js frontend (CORS enabled)

## Error Handling

The API provides consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message",
  "details": ["Validation errors if applicable"]
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `500`: Internal Server Error (AI service issues, network problems) 