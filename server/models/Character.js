//Dependencies
const { model, Schema } = require('mongoose');

//Schema
const characterSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  description: String,
  pictureUrl: String,
  tier: Number, //1: Common, 2: Uncommon, 3: Rare, 4: Epic, 5: Legendary
  attack: Number,
  defense: Number,
  stock: Number, //-1 for infinity (common and uncommon are already infinite)
  sold: Number,
  attributes: [String] //Refer to description below
});

//Schema Methods

characterSchema.methods.sell = async function() {
  await this.updateOne({
    $inc: {
      sold: 1
    }
  });
  return true;
};

//Creating Model
model('Character', characterSchema);

//Attrributes:
//Attributes of a character determine their strength against other cards with specific attributes.
//Types of attributes:
//->Fire
//->Air
//->Water
//->Earth
//->Electric
//->Undead
//->Celestial
//->Intelligent
//->Dumb
//->Mortal
//Attributes vs other attributes:
// Water > Fire
// Electric > Water
// Earth > Electric
// Fire > Earth
// Intelligent > Dumb
// Celestial > Undead
// Undead > Mortal
