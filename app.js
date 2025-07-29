import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import indexRouter from './routes/index.js';
import gptRouter from './routes/gpt.js';
import wakeUpRouter from './routes/wakeUp.js';
import systemRouter from './routes/system.js';
import documentsRouter from './routes/documents.js';

const app = express();

// CORS configuration for frontend communication
app.use(cors({
  origin: process.env.FRONTEND_URL || true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware setup
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' })); // Increased limit for potential larger prompts
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
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
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // For API routes, return JSON error responses
  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({
      success: false,
      error: err.message,
      ...(req.app.get('env') === 'development' && { stack: err.stack })
    });
  }

  // render the error page for non-API routes
  res.status(err.status || 500);
  res.render('error');
});

export default app;
