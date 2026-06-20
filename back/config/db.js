const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize to use SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  // Saves the database file cleanly inside your back directory
  storage: path.join(__dirname, '../database.sqlite'), 
  logging: false, 
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite Database connected successfully!');
    
    // Creates or updates database tables automatically to match models
    await sequelize.sync({ alter: true });
    console.log('Database tables synchronized.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };