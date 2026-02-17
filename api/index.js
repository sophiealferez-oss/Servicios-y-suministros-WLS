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

function initDB() {
  if (sequelize) return Promise.resolve();
  
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

  return sequelize.authenticate()
    .then(() => {
      console.log('Database connection established successfully.');
      return sequelize.sync({ alter: false });
    })
    .then(() => {
      console.log('Database models synchronized.');
      dbReady = true;
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
      throw err;
    });
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

// Routes - Initialize DB before handling requests
app.use('/api/auth', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection error' });
  }
}, authRoutes);

app.use('/api/quotation', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection error' });
  }
}, quotationRoutes);

app.use('/api/contact', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection error' });
  }
}, contactRoutes);

// Vercel serverless function export
module.exports = app;
