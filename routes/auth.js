const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { InMemoryDB } = require('../config/db'); // Import InMemoryDB for fallback
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if we're using in-memory DB
    const isUsingInMemory = typeof global.dbConnection === 'object' && global.dbConnection.constructor.name === 'Object';

    let existingUser;
    if (isUsingInMemory) {
      // For in-memory DB, check manually
      existingUser = InMemoryDB.findUser({ 
        $or: [{ email }, { username }] 
      });
    } else {
      // For MongoDB
      existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
    }
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    let newUser;
    if (isUsingInMemory) {
      // For in-memory DB
      newUser = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        username,
        email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      InMemoryDB.addUser(newUser);
    } else {
      // For MongoDB
      newUser = new User({
        username,
        email,
        password: hashedPassword
      });
      await newUser.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if we're using in-memory DB
    const isUsingInMemory = typeof global.dbConnection === 'object' && global.dbConnection.constructor.name === 'Object';

    let user;
    if (isUsingInMemory) {
      // For in-memory DB, find user manually
      user = InMemoryDB.findUser({ email });
    } else {
      // For MongoDB
      user = await User.findOne({ email });
    }
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;