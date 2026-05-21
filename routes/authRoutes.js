const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/securityMiddleware');

// Public route for login with brute-force protection
router.post('/login', loginLimiter, login);

// Protected profile route
router.get('/me', protect, getMe);

module.exports = router;
