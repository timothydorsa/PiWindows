const sequelize = require('../config/database');
const User = require('./user');
const Post = require('./post');

const initDb = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
};

module.exports = { sequelize, User, Post, initDb };
