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

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING
  },
  machine: {
    type: DataTypes.STRING
  },
  message: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'contacts'
});

module.exports = Contact;
