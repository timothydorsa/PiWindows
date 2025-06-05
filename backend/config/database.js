const { Sequelize } = require('sequelize');

// Use SQLite database for simplicity
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

module.exports = sequelize;
