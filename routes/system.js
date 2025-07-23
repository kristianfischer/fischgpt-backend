const express = require('express');
const router = express.Router();
const { checkServiceHealth } = require('../services/gptService');
const { getEstimatedTokenCount } = require('../config/systemPrompt');


router.get('/health', async (req, res) => {
  try {
    console.log('🔍 Health check requested');
    
    const gptServiceHealthy = await checkServiceHealth();
    const systemPromptTokens = getEstimatedTokenCount();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'FischGPT Backend',
      gptService: {
        status: gptServiceHealthy ? 'healthy' : 'unhealthy',
        systemPromptTokens: systemPromptTokens
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
    
  } catch (error) {
    console.error('💥 Health check error:', error.message);
    
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'FischGPT Backend',
      error: error.message,
      uptime: process.uptime()
    });
  }
});

router.get('/info', (req, res) => {
  res.json({
    success: true,
    service: 'FischGPT Backend',
    description: 'AI assistant for questions about Kristian Fischer',
    version: '1.0.0',
    author: 'Kristian Fischer',
    repository: 'https://github.com/kristianfischer/fischgpt-backend',
    endpoints: {
      chat: 'POST /api/chat - Generate responses about Kristian Fischer',
      
      health: 'GET /api/health - Service health check with detailed status',
      info: 'GET /api/info - Comprehensive service information',
      
      wake: 'POST /api/wake - Fire-and-forget GPU wake-up',
    },
    services: {
      gptService: {
        description: 'Main AI chat functionality',
        model: 'FischGPT-SFT',
        provider: 'Hugging Face Spaces'
      },
      wakeUpService: {
        description: 'GPU optimization and warm-up management',
        costOptimized: true,
        backgroundProcessing: true
      },
      systemService: {
        description: 'Health monitoring and service information',
        realTimeStatus: true
      }
    },
    systemPrompt: {
      estimatedTokens: getEstimatedTokenCount(),
      description: 'Optimized prompt about Kristian Fischer\'s background and expertise',
      subject: 'Kristian Fischer - Software Developer & AI/ML Engineer'
    },
    technical: {
      framework: 'Express.js',
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch
    }
  });
});

router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'FischGPT Backend',
    message: 'Service is running normally'
  });
});

router.get('/version', (req, res) => {
  res.json({
    success: true,
    version: '1.0.0',
    service: 'FischGPT Backend',
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 