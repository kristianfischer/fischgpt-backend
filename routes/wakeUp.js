const express = require('express');
const router = express.Router();
const { wakeUpService, isServiceWarmedUp } = require('../services/wakeUpService');

router.post('/', async (req, res) => {
  try {

    const wakeUpPromise = wakeUpService();
    
    // Respond immediately to frontend
    res.json({
      success: true,
      message: 'Wake-up initiated using dedicated endpoint',
      method: 'dedicated wake-up endpoint',
      timestamp: new Date().toISOString()
    });
    
    wakeUpPromise.then(result => {
      console.log('Wake-up completed:', result);
    }).catch(error => {
      console.error('Wake-up error:', error);
    });
    
  } catch (error) {
    console.error('Wake-up endpoint error:', error.message);
    
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