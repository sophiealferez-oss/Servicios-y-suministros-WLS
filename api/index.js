const express = require('express');
const cors = require('cors');

// Initialize database connection FIRST before importing models
const { Sequelize } = require('sequelize');

let sequelize = null;
let dbReady = false;

async function initDB() {
  if (dbReady) return Promise.resolve();
  
  if (!sequelize) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: console.log, // Enable logging to see what's happening
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
    console.log('✅ Database connection established successfully.');
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized.');
    dbReady = true;
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('Full error:', err);
    throw err;
  }
}

// Import models AFTER DB is initialized
let User, Contact, Quotation;

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await initDB();
    res.json({ 
      status: 'ok', 
      dbReady,
      hasEnv: !!process.env.DATABASE_URL
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ 
      status: 'error', 
      message: err.message,
      hasEnv: !!process.env.DATABASE_URL
    });
  }
});

// Routes wrapper with error handling
function withDBHandler(handler) {
  return async (req, res, next) => {
    try {
      await initDB();
      // Initialize models after DB is ready
      User = require('../models/User');
      Contact = require('../models/Contact');
      Quotation = require('../models/Quotation');
      handler(req, res, next);
    } catch (err) {
      console.error('DB handler error:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Database connection error: ' + err.message 
      });
    }
  };
}

app.use('/auth', withDBHandler(authRoutes));
app.use('/quotation', withDBHandler(quotationRoutes));
app.use('/contact', withDBHandler(contactRoutes));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running', 
    dbReady,
    hasEnv: !!process.env.DATABASE_URL 
  });
});

// Vercel serverless function handler
module.exports = async (req, res) => {
  console.log('🔵 Incoming request:', req.method, req.url);
  try {
    await initDB();
  } catch (err) {
    console.error('DB init error:', err);
  }
  return app(req, res);
};
