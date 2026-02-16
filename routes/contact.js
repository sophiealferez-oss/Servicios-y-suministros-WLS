const express = require('express');
const { InMemoryDB } = require('../config/db');
const router = express.Router();

// Save contact form submission to database
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, machine, message } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Check if we're using in-memory DB
    const isUsingInMemory = typeof global.dbConnection === 'object' && global.dbConnection.constructor.name === 'Object';

    // Create new contact submission
    let newContact;
    if (isUsingInMemory) {
      // For in-memory DB
      newContact = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name,
        email,
        phone: phone || '',
        machine: machine || '',
        message: message || '',
        createdAt: new Date()
      };
      InMemoryDB.addContact(newContact);
    } else {
      // For MongoDB - create model dynamically
      const mongoose = require('mongoose');
      
      const contactSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: String,
        machine: String,
        message: String
      }, { timestamps: true });

      const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
      
      newContact = new Contact({
        name,
        email,
        phone,
        machine,
        message
      });
      await newContact.save();
    }

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
