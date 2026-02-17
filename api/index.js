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
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Connect and sync before handling requests
let dbReady = false;

sequelize.authenticate()
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
  });

// Middleware to check if DB is ready
app.use((req, res, next) => {
  if (!dbReady && req.path !== '/health') {
    return res.status(503).json({
      success: false,
      message: 'Database is initializing, please try again in a few seconds'
    });
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', dbReady });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/contact', contactRoutes);

// Vercel serverless function export
module.exports = app;
