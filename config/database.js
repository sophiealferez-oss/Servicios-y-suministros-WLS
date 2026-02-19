const { Sequelize } = require('sequelize');
require('dotenv').config();

// Check if running in Vercel serverless environment
const isVercel = process.env.VERCEL === '1';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  // Neon requiere SSL
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  // Pool de conexiones optimizado para serverless
  pool: {
    max: isVercel ? 10 : 5,
    min: isVercel ? 2 : 0,
    acquire: 60000,
    idle: 10000
  }
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL (Neon) establecida correctamente.');

    // En Vercel no sincronizamos en cada request para evitar latencia
    if (!isVercel) {
      await sequelize.sync({ alter: false });
      console.log('Modelos sincronizados correctamente.');
    }

    return sequelize;
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL (Neon):', error);
    throw error;
  }
}

module.exports = { sequelize, connectDB };
