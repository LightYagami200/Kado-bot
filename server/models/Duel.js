//Dependencies
const { model, Schema } = require('mongoose');

//Schema
const duelSchema = new Schema({
  duelID: {
    type: String,
    unique: true
  },
  amount: Number,
  player1ID: String,
  player2ID: String,
  currentTurn: String,
  currentPhase: String,
  player1Health: Number,
  player2Health: Number,
  player1Deck: [
    {
      cardName: String,
      cardType: String
    }
  ],
  player2Deck: [
    {
      cardName: String,
      cardType: String
    }
  ],
  player1Hand: [
    {
      cardName: String,
      cardType: String
    }
  ],
  player2Hand: [
    {
      cardName: String,
      cardType: String
    }
  ],
  player1Card: {
    isEmpty: Boolean,
    name: String,
    attack: Number,
    defense: Number,
    attributes: [String]
  },
  player2Card: {
    isEmpty: Boolean,
    name: String,
    attack: Number,
    defense: Number,
    attributes: [String]
  }
});

//Creating Model
model('Duel', duelSchema);
