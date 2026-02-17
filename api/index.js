const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

// Create Express app
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Database connection
let sequelize = null;

async function getDB() {
  if (sequelize) return sequelize;
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false
  });
  
  await sequelize.authenticate();
  await sequelize.sync({ alter: false });
  console.log('✅ DB connected');
  
  return sequelize;
}

// Define models inline to avoid import issues
function defineModels(db) {
  const User = db.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, lowercase: true },
    password: { type: DataTypes.STRING, allowNull: false }
  }, { timestamps: true });
  
  const Contact = db.define('Contact', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    machine: { type: DataTypes.STRING },
    message: { type: DataTypes.TEXT }
  }, { timestamps: true, tableName: 'contacts' });
  
  const Quotation = db.define('Quotation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    equipment: { type: DataTypes.STRING, allowNull: false },
    days: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    contactInfo: { type: DataTypes.JSONB, defaultValue: {} }
  }, { timestamps: true, tableName: 'quotations' });
  
  return { User, Contact, Quotation };
}

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV
  });
});

// Health endpoint
app.get('/health', async (req, res) => {
  try {
    const db = await getDB();
    res.json({ status: 'ok', hasDatabaseUrl: !!process.env.DATABASE_URL });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message, hasDatabaseUrl: !!process.env.DATABASE_URL });
  }
});

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const db = await getDB();
    const { User } = defineModels(db);
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const { Op } = require('sequelize');
    
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] }
    });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword });
    
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    
    res.status(201).json({
      success: true,
      token,
      user: { id: newUser.id, username: newUser.username, email: newUser.email }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const db = await getDB();
    const { User } = defineModels(db);
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    
    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Contact routes
app.post('/contact', async (req, res) => {
  try {
    const db = await getDB();
    const { Contact } = defineModels(db);
    
    const { name, email, phone, machine, message } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email required' });
    }
    
    const newContact = await Contact.create({ name, email, phone: phone || '', machine: machine || '', message: message || '' });
    
    res.status(201).json({ success: true, contact: newContact });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Quotation routes (require auth)
app.post('/quotation', async (req, res) => {
  try {
    const db = await getDB();
    const { Quotation } = defineModels(db);
    const jwt = require('jsonwebtoken');
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }
    
    const user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    const { equipment, days, quantity, totalAmount, contactInfo } = req.body;
    
    const newQuotation = await Quotation.create({
      userId: user.userId,
      equipment,
      days,
      quantity,
      totalAmount,
      contactInfo: contactInfo || {}
    });
    
    res.status(201).json({ success: true, quotation: newQuotation });
  } catch (err) {
    console.error('Quotation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Vercel serverless handler
module.exports = async (req, res) => {
  console.log('🔵 Request:', req.method, req.url);
  return app(req, res);
};
