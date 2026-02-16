const express = require('express');
const Quotation = require('../models/Quotation');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Save a new quotation for an authenticated user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { equipment, days, quantity, totalAmount, contactInfo } = req.body;
    const userId = req.user.userId;

    if (!equipment || !days || !quantity || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const newQuotation = await Quotation.create({
      userId,
      equipment,
      days,
      quantity,
      totalAmount,
      contactInfo: contactInfo || {}
    });

    const user = await User.findByPk(userId);
    newQuotation.user = user;

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

    const quotations = await Quotation.findAll({
      where: { userId },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

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
