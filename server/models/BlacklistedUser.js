//Dependencies
const { model, Schema } = require('mongoose');

//Schema
const blacklistedUserSchema = new Schema({
  userID: {
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
model('BlacklistedUser', blacklistedUserSchema);
