//Dependencies
const { model, Schema } = require('mongoose');

//Schema
const partnerSchema = new Schema({
  guildID: {
    type: String,
    unique: true
  },
  partneredOn: {
    type: Date,
    default: Date.now
  }
});

//Creating Model
model('Partner', partnerSchema);
