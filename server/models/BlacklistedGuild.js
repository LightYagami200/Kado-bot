//Dependencies
const { model, Schema } = require('mongoose');

//Schema
const blacklistedGuildSchema = new Schema({
  guildID: {
    type: String,
    unique: true
  },
  blacklistedOn: {
    type: Date,
    default: Date.now
  },
  reason: String
});

//Creating Model
model('BlacklistedGuild', blacklistedGuildSchema);
