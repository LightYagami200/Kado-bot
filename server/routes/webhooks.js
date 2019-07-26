const { discordBotsAuth } = require('../config/keys');

module.exports = (app, client) => {
  app.post('/webhooks', (req, res) => {
    console.log(req.headers.authorization);
    console.log(req.body);
  });
};
