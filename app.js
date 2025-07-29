import express from 'express';
import path from 'path';
import cors from 'cors';

import indexRouter from './routes/index.js';
import gptRouter from './routes/gpt.js';
import wakeUpRouter from './routes/wakeUp.js';
import systemRouter from './routes/system.js';
import documentsRouter from './routes/documents.js';

const app = express();

// Simple request logging (replaces morgan)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// CORS configuration for frontend communication
app.use(cors({
  origin: process.env.FRONTEND_URL || true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware setup
app.use(express.json({ limit: '10mb' })); // Increased limit for potential larger prompts
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), 'public')));

// API routes (primary functionality)
app.use('/api', gptRouter);
app.use('/api/wake', wakeUpRouter);
app.use('/api', systemRouter);
app.use('/api/documents', documentsRouter);

// Legacy routes (keeping for compatibility)
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// error handler
app.use(function(err, req, res, next) {
  // For API routes, return JSON error responses
  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({
      success: false,
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Simple error response for non-API routes
  res.status(err.status || 500);
  res.json({
    error: err.message,
    status: err.status || 500
  });
});

export default app;
