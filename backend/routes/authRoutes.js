const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile 
} = require('../Controllers/authController');
const { protect } = require('../Middleware/auth');
const upload = require('../Middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, upload.single('profilePhoto'), updateProfile);

module.exports = router;