import sequelize from '../sequelize.js';
import User from './User.js';
import Post from './Post.js';

export { sequelize, User, Post };

export async function initModels() {
  await sequelize.sync();
}
