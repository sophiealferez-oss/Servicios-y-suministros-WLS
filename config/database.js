const { Sequelize } = require('sequelize');
require('dotenv').config();

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

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    
    await sequelize.sync({ alter: false });
    console.log('Modelos sincronizados correctamente.');
    
    return sequelize;
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL:', error);
    throw error;
  }
}

module.exports = { sequelize, connectDB };
