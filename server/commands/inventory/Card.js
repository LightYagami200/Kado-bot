//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const { getCharacterEmbedByName } = require('../../helpers/cards');

//Init
const Deck = mongoose.model('Deck');
const Character = mongoose.model('Character');

//Main
module.exports = class CardCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'card',
      aliases: [],
      group: 'inventory',
      memberName: 'card',
      description: 'View a card that exists in your inventory',
      details:
        'View a card that exists in your inventory. Use this command in DM if you wish to hide this card from everyone else',
      examples: ['card', 'card character "Mumen Rider"'],
      args: [
        {
          key: 'type',
          prompt: 'Input card type',
          type: 'string'
        },
        {
          key: 'name',
          prompt: 'Name of card',
          type: 'string'
        }
      ]
    });
  }

  async run(msg, { type, name }) {
    const deck = await Deck.findOne({ memberID: msg.author.id }).exec();

    if (!deck)
      return msg.embed(
        new RichEmbed()
          .setTitle("Profile doesn't exist")
          .setDescription(
            "Profile doesn't exist, use `register` command to register profile"
          )
          .setColor('#f44336')
      );

    let card;

    if (type === 'character') card = await Character.findOne({ name }).exec();

    if (!card)
      return msg.embed(
        new RichEmbed()
          .setTitle('Invalid type/name')
          .setDescription(
            "Either the type you entered is invalid or the card doesn't exist"
          )
          .setColor('#f44336')
      );

    if (
      !_.includes(deck.reserveCards.map(card => card.cardName), name) &&
      !_.includes(deck.mainDeck.map(card => card.cardName), name)
    )
      return msg.embed(
        new RichEmbed()
          .setTitle("You don't own this card")
          .setDescription(
            "The card you're trying to view doesn't exist in your inventory"
          )
          .setColor('#2196f3')
      );

    if (type === 'character') msg.embed(await getCharacterEmbedByName(name));
  }
};
