const express = require('express');
const cors = require('cors');

// Create Express app FIRST
const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV
  });
});

// Health check endpoint (simple)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    hasDatabaseUrl: !!process.env.DATABASE_URL
  });
});

// Import and setup routes ONLY when DB is ready
app.use('/auth', async (req, res, next) => {
  try {
    // Initialize DB on first request
    if (!global.sequelize) {
      const { Sequelize } = require('sequelize');
      
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ 
          success: false, 
          message: 'DATABASE_URL not configured' 
        });
      }
      
      global.sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false
      });
      
      await global.sequelize.authenticate();
      await global.sequelize.sync({ alter: false });
      console.log('✅ DB connected');
    }
    
    // Now import routes with DB ready
    const authRoutes = require('../routes/auth');
    authRoutes(req, res, next);
  } catch (err) {
    console.error('❌ Auth error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Auth error: ' + err.message 
    });
  }
});

app.use('/contact', async (req, res, next) => {
  try {
    if (!global.sequelize) {
      const { Sequelize } = require('sequelize');
      global.sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false
      });
      await global.sequelize.authenticate();
      await global.sequelize.sync({ alter: false });
    }
    
    const contactRoutes = require('../routes/contact');
    contactRoutes(req, res, next);
  } catch (err) {
    console.error('❌ Contact error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Contact error: ' + err.message 
    });
  }
});

app.use('/quotation', async (req, res, next) => {
  try {
    if (!global.sequelize) {
      const { Sequelize } = require('sequelize');
      global.sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false
      });
      await global.sequelize.authenticate();
      await global.sequelize.sync({ alter: false });
    }
    
    const quotationRoutes = require('../routes/quotation');
    quotationRoutes(req, res, next);
  } catch (err) {
    console.error('❌ Quotation error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Quotation error: ' + err.message 
    });
  }
});

// Vercel serverless handler
module.exports = async (req, res) => {
  console.log('🔵 Request:', req.method, req.url);
  return app(req, res);
};
