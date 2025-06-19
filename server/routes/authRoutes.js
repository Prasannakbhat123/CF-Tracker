const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Login route
router.post('/login', login);

// Get current admin route (protected)
router.get('/me', protect, getMe);

module.exports = router;
