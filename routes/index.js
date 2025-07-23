var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.json({
    message: 'Welcome to FischGPT Backend API',
    endpoints: {
      chat: 'POST /api/chat',
      health: 'GET /api/health'
    },
    documentation: 'See README.md for full API documentation'
  });
});
module.exports = router;
