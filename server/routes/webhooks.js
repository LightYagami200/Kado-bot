module.exports = (app, client) => {
  app.get('/webhooks', (req, res) => {
    return res.json({ err: 'Invalid type' });
  });
};
