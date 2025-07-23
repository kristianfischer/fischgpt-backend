const express = require('express');
const router = express.Router();
const { wakeUpService, isServiceWarmedUp } = require('../services/wakeUpService');

/**
 * POST /api/wake
 * Wakes up the AI service to reduce latency on first real request
 * This should be called when the website loads
 * 
 * Features:
 * - Uses dedicated wake-up endpoint (no token cost!)
 * - Responds immediately (fire-and-forget)
 * - Actual wake-up happens in background
 * - Much faster than previous method
 */
router.post('/', async (req, res) => {
  try {
    console.log('🌅 Wake-up request received from frontend');
    
    // Start wake-up process (don't await to respond quickly)
    const wakeUpPromise = wakeUpService();
    
    // Respond immediately to frontend
    res.json({
      success: true,
      message: 'Wake-up initiated using dedicated endpoint',
      method: 'dedicated wake-up endpoint',
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


module.exports = router; 