//Dependencies
const { model, Schema } = require('mongoose');

//Schema
const couponSchema = new Schema({
  couponCode: {
    type: String,
    unique: true
  },
  maxUses: Number,
  coins: Number,
  usedBy: [String]
});

//Schema Methods
couponSchema.methods.used = async function(memberID) {
  await this.updateOne({
    $push: {
      usedBy: memberID
    }
  });

  return true;
};

//Creating Model
model('Coupon', couponSchema);
