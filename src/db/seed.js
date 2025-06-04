import { sequelize, User, Post, initModels } from './models/index.js';

async function seed() {
  await sequelize.sync({ force: true });

  const user = await User.create({ username: 'admin', password: 'admin' });

  await Post.bulkCreate([
    { title: 'First Post', content: 'Seed post', userId: user.id },
    { title: 'Second Post', content: 'Another seed post', userId: user.id },
  ]);

  console.log('Database seeded');
  await sequelize.close();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
