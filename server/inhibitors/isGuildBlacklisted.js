module.exports = guildID => {
  if (require('./blacklistedGuilds').has(guildID)) return true;
  else return false;
};
