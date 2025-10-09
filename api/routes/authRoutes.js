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

// Email verification removed: users are verified on registration

module.exports = router;
