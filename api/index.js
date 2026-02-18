const pg = require('pg');
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
    dialectModule: pg,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });

  await sequelize.authenticate();
  await sequelize.sync({ alter: false });
  console.log('✅ DB connected');
  
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
    }, { timestamps: true, tableName: 'contacts' }),

    Quotation: sequelize.define('Quotation', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
      equipment: { type: DataTypes.STRING, allowNull: false },
      days: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
      contactInfo: { type: DataTypes.JSONB, defaultValue: {} }
    }, { timestamps: true, tableName: 'quotations' })
  };

  models.Quotation.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  models.User.hasMany(models.Quotation, { foreignKey: 'userId', as: 'quotations' });
  
  return { db: sequelize, models };
}

function sendJSON(res, statusCode, data) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 200, { ok: true });
  }
  
  console.log(`🔵 ${req.method} ${req.url}`);
  
  try {
    const path = req.url.replace(/^\/api/, '');
    
    if (path === '/test' && req.method === 'GET') {
      return sendJSON(res, 200, {
        message: 'API is working!',
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      });
    }
    
    if (path === '/health' && req.method === 'GET') {
      try {
        await getDB();
        return sendJSON(res, 200, { status: 'ok', hasDatabaseUrl: !!process.env.DATABASE_URL });
      } catch (err) {
        return sendJSON(res, 500, { status: 'error', message: err.message, hasDatabaseUrl: !!process.env.DATABASE_URL });
      }
    }
    
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

    if (path === '/quotation' && req.method === 'GET') {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return sendJSON(res, 401, { success: false, message: 'Access token required' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const { models } = await getDB();

        const quotations = await models.Quotation.findAll({
          where: { userId: decoded.userId },
          include: [{ model: models.User, as: 'user', attributes: ['id', 'username', 'email'] }],
          order: [['createdAt', 'DESC']]
        });

        return sendJSON(res, 200, { success: true, quotations });
      } catch (err) {
        console.error('Get quotations error:', err);
        return sendJSON(res, 500, { success: false, message: err.message });
      }
    }

    if (path === '/quotation' && req.method === 'POST') {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return sendJSON(res, 401, { success: false, message: 'Access token required' });
      }

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          const { models } = await getDB();
          const { equipment, days, quantity, totalAmount, contactInfo } = JSON.parse(body);

          if (!equipment || !days || !quantity || !totalAmount) {
            return sendJSON(res, 400, { success: false, message: 'Missing required fields' });
          }

          const newQuotation = await models.Quotation.create({
            userId: decoded.userId,
            equipment,
            days,
            quantity,
            totalAmount,
            contactInfo: contactInfo || {}
          });

          const user = await models.User.findByPk(decoded.userId);
          newQuotation.user = user;

          return sendJSON(res, 201, { success: true, quotation: newQuotation });
        } catch (err) {
          console.error('Save quotation error:', err);
          return sendJSON(res, 500, { success: false, message: err.message });
        }
      });
      return;
    }
    
    return sendJSON(res, 404, { error: 'Not found', path: path, method: req.method });
    
  } catch (err) {
    console.error('❌ API error:', err);
    return sendJSON(res, 500, { success: false, message: 'Internal error: ' + err.message });
  }
};