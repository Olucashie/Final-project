const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  verifyEmail,
  resendVerification 
} = require('../controllers/authController');

// Authentication routes
router.post('/register', register);
router.post('/login', login);

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

module.exports = router;
