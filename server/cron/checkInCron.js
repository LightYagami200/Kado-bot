const schedule = require('node-schedule');
const mongoose = require('mongoose');

schedule.scheduleJob('0 0 0 * * *', () => {
  mongoose
    .model('Profile')
    .updateMany({}, { checkedIn: false })
    .exec();
});
