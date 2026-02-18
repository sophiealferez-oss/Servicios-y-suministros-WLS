require('dotenv').config();
const { sequelize, connectDB } = require('./config/database');

async function syncModels() {
  try {
    console.log('Conectando a la base de datos...');
    await connectDB();
    
    console.log('Sincronizando modelos...');
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Tablas creadas exitosamente!');
    console.log('Tablas disponibles:');
    
    const tables = await sequelize.queryInterface.showAllTables();
    console.log(tables);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

syncModels();
