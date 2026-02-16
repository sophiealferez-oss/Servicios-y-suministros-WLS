const mongoose = require('mongoose');

// Check if we're using MongoDB or in-memory DB
const isMongoDB = typeof global.dbConnection !== 'object' || global.dbConnection.constructor.name !== 'Object';

if (isMongoDB) {
  // Use MongoDB schema
  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    }
  }, {
    timestamps: true // Adds createdAt and updatedAt fields
  });

  module.exports = mongoose.model('User', userSchema);
} else {
  // Use in-memory model
  class User {
    constructor(userData) {
      this._id = Date.now().toString() + Math.random().toString(36).substr(2, 5); // Simple ID generator
      this.username = userData.username;
      this.email = userData.email;
      this.password = userData.password;
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    static async findOne(query) {
      const users = global.dbConnection.users;
      return users.find(u => {
        for (let key in query) {
          if (u[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    }

    static async create(userData) {
      const newUser = new User(userData);
      global.dbConnection.users.push(newUser);
      return newUser;
    }

    // Method to save the user
    async save() {
      global.dbConnection.users.push(this);
      return this;
    }
  }

  module.exports = User;
}