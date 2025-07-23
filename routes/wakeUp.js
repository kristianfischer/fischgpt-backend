const express = require('express');
const router = express.Router();
const { wakeUpService, isServiceWarmedUp } = require('../services/wakeUpService');

/**
 * POST /api/wake
 * Wakes up the AI service to reduce latency on first real request
 * This should be called when the website loads
 * 
 * Features:
 * - Responds immediately (fire-and-forget)
 * - Actual wake-up happens in background
 * - Optimized for minimal cost
 */
router.post('/', async (req, res) => {
  try {
    console.log('🌅 Wake-up request received from frontend');
    
    // Start wake-up process (don't await to respond quickly)
    const wakeUpPromise = wakeUpService();
    
    // Respond immediately to frontend
    res.json({
      success: true,
      message: 'Wake-up initiated',
      timestamp: new Date().toISOString()
    });
    
    // Log wake-up result in background
    wakeUpPromise.then(result => {
      console.log('🎯 Wake-up completed:', result);
    }).catch(error => {
      console.error('❌ Wake-up error:', error);
    });
    
  } catch (error) {
    console.error('💥 Wake-up endpoint error:', error.message);
    
    // Even if there's an error, respond successfully since this is non-critical
    res.json({
      success: true,
      message: 'Wake-up request received (error in background)',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /api/wake/status
 * Check if the AI service is already warmed up
 * 
 * Returns:
 * - warmedUp: boolean indicating if service is ready
 * - responseTime: how long the check took
 * - message: human-readable status
 */
router.get('/status', async (req, res) => {
  try {
    console.log('🔍 Checking wake-up status...');
    
    const status = await isServiceWarmedUp();
    
    res.json({
      success: true,
      warmedUp: status.isWarmed,
      responding: status.responding,
      responseTime: status.responseTime,
      message: status.isWarmed 
        ? 'Service is warmed up and ready' 
        : status.responding 
          ? 'Service is responding but may be slow'
          : 'Service may need wake-up',
      timestamp: new Date().toISOString(),
      ...(status.error && { error: status.error })
    });
    
  } catch (error) {
    console.error('💥 Wake-up status check error:', error.message);
    
    res.json({
      success: false,
      warmedUp: false,
      responding: false,
      responseTime: null,
      message: 'Unable to determine service status',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * POST /api/wake/force
 * Force a wake-up and wait for completion
 * Use this for testing or when you need to ensure service is ready
 */
router.post('/force', async (req, res) => {
  try {
    console.log('🚀 Force wake-up request received');
    
    const result = await wakeUpService();
    
    res.json({
      success: result.success,
      wakeUpTime: result.wakeUpTime,
      message: result.message,
      timestamp: new Date().toISOString(),
      metadata: result.metadata,
      ...(result.error && { error: result.error })
    });
    
  } catch (error) {
    console.error('💥 Force wake-up error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Force wake-up failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /api/wake/info
 * Get information about the wake-up system
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    service: 'FischGPT Wake-up Service',
    description: 'GPU warm-up system to reduce cold start latency',
    version: '1.0.0',
    endpoints: {
      wake: 'POST /api/wake - Initiate background wake-up (fire-and-forget)',
      status: 'GET /api/wake/status - Check current warm-up status',
      force: 'POST /api/wake/force - Force wake-up and wait for completion',
      info: 'GET /api/wake/info - Wake-up system information'
    },
    optimization: {
      costOptimized: true,
      backgroundProcessing: true,
      minimalTokenUsage: true,
      responseTime: 'Typically < 5ms for initial response'
    }
  });
});

module.exports = router; 