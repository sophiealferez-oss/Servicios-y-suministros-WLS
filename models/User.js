const { DataTypes } = require('sequelize');

// Get sequelize instance from process or create one
let sequelize;

if (typeof window === 'undefined') {
  // Server-side (Node.js)
  const dbModule = require('../config/database');
  sequelize = dbModule.sequelize;
  
  // If sequelize is not initialized (Vercel), create one
  if (!sequelize) {
    const { Sequelize } = require('sequelize');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false
    });
  }
}

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    trim: true,
    validate: {
      len: [3, 30]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6]
    }
  }
}, {
  timestamps: true
});

module.exports = User;
