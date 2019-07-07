const BlacklistedGuilds = (module.exports = {
  list: [],
  add: function(id) {
    BlacklistedGuilds.list.push(id);
  },
  remove: function(id) {
    BlacklistedGuilds.list = BlacklistedGuilds.list.filter(
      guildID => guildID === id
    );
  },
  has: function(id) {
    return BlacklistedGuilds.list.find(guildID => guildID === id) === undefined
      ? false
      : true;
  }
});
