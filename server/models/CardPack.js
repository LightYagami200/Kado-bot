//Dependencies
const { model, Schema } = require('mongoose');
const Probability = require('probability-node');
const _ = require('lodash');

//Schema
const cardPackSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  description: String,
  cards: Number, //Number of cards in this pack
  type: String, //'character', 'spell', 'item', 'all'
  tier: Number,
  probability: {
    //Probability of getting cards of a specific tier
    1: Number,
    2: Number,
    3: Number,
    4: Number,
    5: Number
  },
  price: Number,
  discount: Number, //Discount in %
  stock: Number, // -1 for infinite
  guaranteedTier: Number //Refer to description below
});

//Schema Methods
cardPackSchema.methods.purchase = async function(memberID) {
  //->Initialization
  const profile = await this.model('Profile')
    .findOne({ memberID })
    .exec();

  //->Validation
  if (this.stock === 0)
    return {
      res: 'err',
      title: 'Not available',
      desc: 'The pack you are trying to purchase is out of stock'
    };

  if (profile.coins < this.price - this.price * this.discount)
    return {
      res: 'err',
      title: 'Insufficient Coins',
      desc: 'You do not have sufficient coins to purchase this pack'
    };

  //->Purchasing
  const cards = []; //Cards to give to the player;

  //-> Adding Guaranteed tier card
  if (this.guaranteedTier > 1) {
    addCard.call(this, this.guaranteedTier);
    this.cards--;
  }

  //->Probabilitized function
  const addRandomCard = new Probability(
    {
      p: this.probability['1'],
      f: () => addCard.call(this, 1)
    },
    {
      p: this.probability['2'],
      f: () => addCard.call(this, 2)
    },
    {
      p: this.probability['3'],
      f: () => addCard.call(this, 3)
    },
    {
      p: this.probability['4'],
      f: () => addCard.call(this, 4)
    },
    {
      p: this.probability['5'],
      f: () => addCard.call(this, 5)
    }
  );

  //-> Adding the rest of the cards
  for (var i = 1 + cards.length; i <= this.cards; i++) {
    await addRandomCard();
  }

  //->Add Cards to inventory
  const deck = await this.model('Deck')
    .findOne({ memberID })
    .exec();

  profile.deductCoins(this.price - this.price * this.discount);
  profile.addExp(this.tier ** this.tier + this.price / 20);

  await deck.addCards(cards);
  //->Return card names
  return {
    res: 'success',
    cards
  };

  //->Add Card function
  async function addCard(tier) {
    const randomTypeCard = Math.floor(Math.random() * 1) + 1;

    //Adding a Character card
    if (
      (randomTypeCard === 1 && this.type === 'all') ||
      this.type === 'character'
    ) {
      const cardToAdd = _.sample(await model('Character').find({ tier }));
      cardToAdd.type = 'character';
      if (
        !_.includes(cards.map(card => card.name), cardToAdd.name) ||
        cardToAdd.sold >= cardToAdd.stock
      ) {
        await cardToAdd.sell();
        cards.push(cardToAdd);
      } else addCard.call(this, tier);
    }
  }
};

//Creating Model
model('CardPack', cardPackSchema);

//Guaranteed Tier:
//Refers to the tier of the card that player is guaranteed to get, refer below:
//0-1: Not guaranteed any card
//2: At least one uncommon cuard
//3: At least one rare card
//4: At least one epic card
//5: At least one legendary card
