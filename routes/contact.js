const express = require('express');
const Contact = require('../models/Contact');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, machine, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const newContact = await Contact.create({
      name,
      email,
      phone: phone || '',
      machine: machine || '',
      message: message || ''
    });

    res.status(201).json({
      success: true,
      message: 'Contact saved successfully',
      contact: newContact
    });
  } catch (error) {
    console.error('Save contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
