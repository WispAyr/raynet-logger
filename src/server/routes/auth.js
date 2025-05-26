const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { callsign, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ callsign });
    if (existingUser) {
      return res.status(400).json({ message: 'Callsign already registered' });
    }

    // Create new user
    const user = new User({ callsign, password });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { callsign, password } = req.body;
    console.log(`[LOGIN] Attempt for callsign: ${callsign}`);
    
    // Find user
    const user = await User.findOne({ callsign });
    if (!user) {
      console.log(`[LOGIN] User not found for callsign: ${callsign}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[LOGIN] Password mismatch for callsign: ${callsign}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[LOGIN] Success for callsign: ${callsign}`);
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ user, token });
  } catch (error) {
    console.error(`[LOGIN] Error for callsign: ${req.body.callsign}`, error);
    res.status(400).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    // In a real application, you might want to invalidate the token
    // For now, we'll just return success
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 