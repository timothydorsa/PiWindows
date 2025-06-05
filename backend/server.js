const express = require('express');
const bodyParser = require('body-parser');
const { initDb } = require('./models');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(bodyParser.json());
app.use('/api', userRoutes);

const PORT = process.env.PORT || 4000;

initDb().then(() => {
  app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
}).catch(err => {
  console.error('Failed to start backend:', err);
});
