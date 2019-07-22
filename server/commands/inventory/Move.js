//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const redis = require('redis');
const bluebird = require('bluebird');

//Init
const Deck = mongoose.model('Deck');
const Character = mongoose.model('Character');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

//Main
module.exports = class MoveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'move',
      aliases: ['m'],
      group: 'inventory',
      memberName: 'move',
      description: 'Move a card among your decks/reserve',
      details:
        'Move a card to and fro main deck and reserve. Use this command in DM to avoid anyone from seeing your decks',
      examples: [
        'move',
        'move character "Mumen Rider" reserve main',
        'move character Aqua main reserve'
      ],
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
        },
        {
          key: 'from',
          prompt: 'Where to move the card from?',
          type: 'string'
        },
        {
          key: 'to',
          prompt: 'Where to move the card to?',
          type: 'string'
        }
      ]
    });
  }

  async run(msg, { type, name, from, to }) {
    const deck = await Deck.findOne({ memberID: msg.author.id }).exec();

    if (!deck)
      return msg.embed(
        new MessageEmbed()
          .setTitle("Profile doesn't exist")
          .setDescription(
            "Profile doesn't exist, use `register` command to register profile"
          )
          .setColor('#f44336')
      );

    const res = await client.existsAsync(`duelers:${msg.author.id}`);
    if (res != 0)
      return msg.embed(
        new MessageEmbed()
          .setTitle('In duel!')
          .setDescription(
            "You can't use this commmand while in the middle of a duel"
          )
          .setColor('#f44336')
      );

    let card;

    if (type === 'character') card = await Character.findOne({ name }).exec();

    if (!card)
      return msg.embed(
        new MessageEmbed()
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
        new MessageEmbed()
          .setTitle("You don't own this card")
          .setDescription(
            "The card you're trying to move doesn't exist in your inventory"
          )
          .setColor('#2196f3')
      );

    if (
      (from === 'main' && to === 'reserve') ||
      (from === 'reserve' && to === 'main')
    ) {
      //Move the card
      const res = await deck.moveCard(type, name, from, to);

      if (!res)
        return msg.embed(
          new MessageEmbed()
            .setTitle('Not enough space')
            .setDescription(
              'Your main deck has reached its max limit, level up to increase the size of your main deck'
            )
            .setColor('#f44336')
        );

      if (res == 3)
        return msg.embed(
          new MessageEmbed()
            .setTitle('Card not available')
            .setDescription(
              `The card you're trying to move from \`${from}\` doesn't exist in your \`${from}\``
            )
            .setColor('#f44336')
        );

      msg.embed(
        new MessageEmbed()
          .setTitle('Successfully moved')
          .setDescription(
            `Card successfully move from \`${from}\` to \`${to}\``
          )
          .setColor('#2196f3')
      );
    } else {
      return msg.embed(
        new MessageEmbed()
          .setTitle('Invalid input')
          .setDescription('Invalid `to` or `from` args')
          .setColor('#f44336')
      );
    }
  }
};
