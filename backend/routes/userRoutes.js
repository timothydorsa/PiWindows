const express = require('express');
const { User, Post } = require('../models');
const router = express.Router();

router.get('/users', async (req, res) => {
  const users = await User.findAll({ include: Post });
  res.json(users);
});

router.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

module.exports = router;
