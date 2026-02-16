const mongoose = require('mongoose');

// Check if we're using MongoDB or in-memory DB
const isMongoDB = typeof global.dbConnection !== 'object' || global.dbConnection.constructor.name !== 'Object';

if (isMongoDB) {
  // Use MongoDB schema
  const quotationSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    equipment: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true
    },
    days: {
      type: Number,
      required: [true, 'Number of days is required'],
      min: [1, 'Days must be at least 1']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    contactInfo: {
      fullName: String,
      phoneNumber: String,
      address: String,
      additionalNotes: String
    }
  }, {
    timestamps: true // Adds createdAt and updatedAt fields
  });

  module.exports = mongoose.model('Quotation', quotationSchema);
} else {
  // Use in-memory model
  class Quotation {
    constructor(data) {
      this._id = Date.now().toString() + Math.random().toString(36).substr(2, 5); // Simple ID generator
      this.user = data.user; // This should be a user ID
      this.equipment = data.equipment;
      this.days = data.days;
      this.quantity = data.quantity;
      this.totalAmount = data.totalAmount;
      this.contactInfo = data.contactInfo || {};
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    static async find(query) {
      let quotations = global.dbConnection.quotations;
      
      // Filter based on query
      if (query.user) {
        quotations = quotations.filter(q => q.user.toString() === query.user.toString());
      }
      
      return quotations;
    }

    static async create(data) {
      const newQuotation = new Quotation(data);
      global.dbConnection.quotations.push(newQuotation);
      return newQuotation;
    }
  }

  module.exports = Quotation;
}