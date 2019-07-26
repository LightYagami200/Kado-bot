//Dependencies
const { discordBotsAuth } = require('../config/keys');
const mongoose = require('mongoose');

//Init
const Profile = mongoose.model('Profile');

module.exports = (app, client) => {
  app.post('/webhooks', async (req, res) => {
    if (req.headers.authorization !== discordBotsAuth)
      return res.status(401).json({ err: 'Invalid Authorization Header' });

    const profile = await Profile.findOne({ memberID: req.body.user }).exec();

    if (!profile) return;

    return profile.addCoins(10);
  });
};
