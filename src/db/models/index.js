import sequelize from '../sequelize.js';
import User from './User.js';

export { sequelize, User };

export async function initModels() {
  await sequelize.sync();
}
