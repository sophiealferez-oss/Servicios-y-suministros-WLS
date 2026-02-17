const { Sequelize, DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Database connection
let sequelize = null;
let models = null;

async function getDB() {
  if (models) return { db: sequelize, models };
  
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
  
  // Define models
  models = {
    User: sequelize.define('User', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, lowercase: true },
      password: { type: DataTypes.STRING, allowNull: false }
    }, { timestamps: true }),
    
    Contact: sequelize.define('Contact', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING },
      machine: { type: DataTypes.STRING },
      message: { type: DataTypes.TEXT }
    }, { timestamps: true, tableName: 'contacts' })
  };
  
  return { db: sequelize, models };
}

// Helper function to send JSON response
function sendJSON(res, statusCode, data) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

// Main handler
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 200, { ok: true });
  }
  
  console.log(`🔵 ${req.method} ${req.url}`);
  
  try {
    const path = req.url.replace(/^\/api/, '');
    
    // Test endpoint
    if (path === '/test' && req.method === 'GET') {
      return sendJSON(res, 200, {
        message: 'API is working!',
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      });
    }
    
    // Health endpoint
    if (path === '/health' && req.method === 'GET') {
      try {
        await getDB();
        return sendJSON(res, 200, { status: 'ok', hasDatabaseUrl: !!process.env.DATABASE_URL });
      } catch (err) {
        return sendJSON(res, 500, { status: 'error', message: err.message, hasDatabaseUrl: !!process.env.DATABASE_URL });
      }
    }
    
    // Register
    if (path === '/auth/register' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { username, email, password } = JSON.parse(body);
          const { models } = await getDB();
          
          const existingUser = await models.User.findOne({
            where: { [Op.or]: [{ email }, { username }] }
          });
          
          if (existingUser) {
            return sendJSON(res, 400, { success: false, message: 'User already exists' });
          }
          
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await models.User.create({ username, email, password: hashedPassword });
          
          const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
          
          return sendJSON(res, 201, {
            success: true,
            token,
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
          });
        } catch (err) {
          console.error('Register error:', err);
          return sendJSON(res, 500, { success: false, message: err.message });
        }
      });
      return;
    }
    
    // Login
    if (path === '/auth/login' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { email, password } = JSON.parse(body);
          const { models } = await getDB();
          
          const user = await models.User.findOne({ where: { email } });
          if (!user) {
            return sendJSON(res, 400, { success: false, message: 'Invalid credentials' });
          }
          
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return sendJSON(res, 400, { success: false, message: 'Invalid credentials' });
          }
          
          const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
          
          return sendJSON(res, 200, {
            success: true,
            token,
            user: { id: user.id, username: user.username, email: user.email }
          });
        } catch (err) {
          console.error('Login error:', err);
          return sendJSON(res, 500, { success: false, message: err.message });
        }
      });
      return;
    }
    
    // Contact
    if (path === '/contact' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { name, email, phone, machine, message } = JSON.parse(body);
          const { models } = await getDB();
          
          if (!name || !email) {
            return sendJSON(res, 400, { success: false, message: 'Name and email required' });
          }
          
          const newContact = await models.Contact.create({ name, email, phone: phone || '', machine: machine || '', message: message || '' });
          
          return sendJSON(res, 201, { success: true, contact: newContact });
        } catch (err) {
          console.error('Contact error:', err);
          return sendJSON(res, 500, { success: false, message: err.message });
        }
      });
      return;
    }
    
    // 404 for unknown routes
    return sendJSON(res, 404, { error: 'Not found', path: path, method: req.method });
    
  } catch (err) {
    console.error('❌ API error:', err);
    return sendJSON(res, 500, { success: false, message: 'Internal error: ' + err.message });
  }
};
