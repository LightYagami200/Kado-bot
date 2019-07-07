const BlacklistedUsers = (module.exports = {
  list: [],
  add: function(id) {
    BlacklistedUsers.list.push(id);
  },
  remove: function(id) {
    BlacklistedUsers.list = BlacklistedUsers.list.filter(
      userID => userID !== id
    );
  },
  has: function(id) {
    return BlacklistedUsers.list.find(userID => userID === id) === undefined
      ? false
      : true;
  }
});
