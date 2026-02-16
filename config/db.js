// config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// In-memory storage for testing without MongoDB
let users = [];
let quotations = [];

class InMemoryDB {
  static async connect() {
    console.log('Using in-memory database for development');
    return { users, quotations };
  }
  
  static getUsers() {
    return users;
  }
  
  static getQuotations() {
    return quotations;
  }
  
  static addUser(user) {
    users.push(user);
    return user;
  }
  
  static addQuotation(quotation) {
    quotations.push(quotation);
    return quotation;
  }
  
  static findUser(query) {
    return users.find(u => {
      for (let key in query) {
        if (u[key] !== query[key]) return false;
      }
      return true;
    });
  }
  
  static findQuotationsByUserId(userId) {
    return quotations.filter(q => q.user === userId || q.user._id === userId);
  }
  
  static clear() {
    users = [];
    quotations = [];
  }
}

// Connect to database based on environment
async function connectDB() {
  if (process.env.USE_IN_MEMORY_DB === 'true') {
    return InMemoryDB.connect();
  } else {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
      return mongoose.connection;
    } catch (error) {
      console.error('Could not connect to MongoDB', error);
      console.log('Falling back to in-memory database');
      return InMemoryDB.connect();
    }
  }
}

module.exports = { connectDB, InMemoryDB };