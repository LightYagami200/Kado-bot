//Dependencies
const { model, Schema } = require('mongoose');
const _ = require('lodash');

//Schema
const deckSchema = new Schema({
  memberID: {
    type: String,
    unique: true
  },
  reserveCards: [
    {
      cardType: String,
      cardName: String
    }
  ],
  mainDeck: [
    {
      cardType: String,
      cardName: String
    }
  ],
  mainDeckSize: Number
});

//Schema Methods
deckSchema.methods.addCards = async function(cardsArray) {
  cardsArray.forEach(card => {
    this.reserveCards.push({
      cardType: card.type,
      cardName: card.name
    });
  });

  await this.save();

  return true;
};

deckSchema.methods.moveCard = async function(type, cardName, from, to) {
  if (from === 'reserve' && to === 'main') {
    if (this.mainDeck.length >= this.mainDeckSize) return false;

    const index = _.findIndex(
      this.reserveCards,
      card => card.cardName === cardName
    );

    const removedCard = this.reserveCards.splice(index, index >= 0 ? 1 : 0);

    if (removedCard.length < 1) return 3;

    this.mainDeck.push({
      cardType: type,
      cardName: cardName
    });
  } else if (from === 'main' && to === 'reserve') {
    const index = _.findIndex(
      this.mainDeck,
      card => card.cardName === cardName
    );

    const removedCard = this.mainDeck.splice(index, index >= 0 ? 1 : 0);

    if (removedCard.length < 1) return 3;

    this.reserveCards.push({
      cardType: type,
      cardName: cardName
    });
  }

  await this.save();

  return true;
};

deckSchema.methods.increaseMainDeckSize = async function() {
  this.mainDeckSize += 2;
  await this.save();
  return true;
};

//Creating Model
model('Deck', deckSchema);
