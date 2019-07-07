module.exports = userID => {
  if (require('./blacklistedUsers').has(userID)) return true;
  else return false;
};
