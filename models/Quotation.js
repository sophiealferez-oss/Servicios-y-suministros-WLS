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

const User = require('./User');

const Quotation = sequelize.define('Quotation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: User,
      key: 'id'
    }
  },
  equipment: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  contactInfo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true,
  tableName: 'quotations'
});

Quotation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Quotation, { foreignKey: 'userId', as: 'quotations' });

module.exports = Quotation;
