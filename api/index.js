const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');

// Import models to initialize them
const User = require('../models/User');
const Contact = require('../models/Contact');
const Quotation = require('../models/Quotation');

// Import routes
const authRoutes = require('../routes/auth');
const quotationRoutes = require('../routes/quotation');
const contactRoutes = require('../routes/contact');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Initialize database connection
let sequelize = null;
let dbReady = false;

async function initDB() {
  if (dbReady) return Promise.resolve();
  
  if (!sequelize) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  }

  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    await sequelize.sync({ alter: false });
    console.log('Database models synchronized.');
    dbReady = true;
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    throw err;
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await initDB();
    res.json({ status: 'ok', dbReady });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/contact', contactRoutes);

// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    await initDB();
  } catch (err) {
    console.error('DB init error:', err);
  }
  return app(req, res);
};
