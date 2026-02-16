const express = require('express');
const Quotation = require('../models/Quotation');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');
const { InMemoryDB } = require('../config/db'); // Import InMemoryDB for fallback
const router = express.Router();

// Save a new quotation for an authenticated user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { equipment, days, quantity, totalAmount, contactInfo } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!equipment || !days || !quantity || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if we're using in-memory DB
    const isUsingInMemory = typeof global.dbConnection === 'object' && global.dbConnection.constructor.name === 'Object';

    // Create new quotation
    let newQuotation;
    if (isUsingInMemory) {
      // For in-memory DB
      newQuotation = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        user: userId,
        equipment,
        days,
        quantity,
        totalAmount,
        contactInfo: contactInfo || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      InMemoryDB.addQuotation(newQuotation);
    } else {
      // For MongoDB
      newQuotation = new Quotation({
        user: userId,
        equipment,
        days,
        quantity,
        totalAmount,
        contactInfo: contactInfo || {}
      });
      await newQuotation.save();
    }

    // For in-memory DB, we can't populate user info, so we'll just return the quotation
    if (isUsingInMemory) {
      // Get user info from in-memory DB
      const user = InMemoryDB.findUser({ _id: userId });
      newQuotation.user = {
        _id: user._id,
        username: user.username,
        email: user.email
      };
    }

    res.status(201).json({
      success: true,
      message: 'Quotation saved successfully',
      quotation: newQuotation
    });
  } catch (error) {
    console.error('Save quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all quotations for an authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if we're using in-memory DB
    const isUsingInMemory = typeof global.dbConnection === 'object' && global.dbConnection.constructor.name === 'Object';

    let quotations;
    if (isUsingInMemory) {
      // For in-memory DB
      quotations = InMemoryDB.findQuotationsByUserId(userId);
      
      // Get user info for each quotation
      for (let quotation of quotations) {
        const user = InMemoryDB.findUser({ _id: quotation.user });
        if (user) {
          quotation.user = {
            _id: user._id,
            username: user.username,
            email: user.email
          };
        }
      }
    } else {
      // For MongoDB
      quotations = await Quotation.find({ user: userId })
        .populate('user', 'username email')
        .sort({ createdAt: -1 })
        .exec();
    }

    res.json({
      success: true,
      quotations
    });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;