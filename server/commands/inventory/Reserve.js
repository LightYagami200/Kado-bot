//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');

//Init
const Deck = mongoose.model('Deck');

//Main
module.exports = class ReserveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reserve',
      guildOnly: true,
      aliases: [],
      group: 'inventory',
      memberName: 'reserve',
      description: 'Show all the cards in your reserve deck',
      examples: ['reserve']
    });
  }

  async run(msg) {
    const deck = await Deck.findOne({ memberID: msg.member.id }).exec();

    if (!deck)
      return msg.embed(
        new MessageEmbed()
          .setTitle("Profile doesn't exist")
          .setDescription(
            "Profile doesn't exist, use `register` command to register profile"
          )
          .setColor('#f44336')
      );

    let str = '';

    let arr = [];

    deck.reserveCards.forEach(card => {
      if (_.includes(arr.map(c => c[0]), card.cardName))
        arr[_.findIndex(arr, c => c[0] === card.cardName)][1]++;
      else arr.push([card.cardName, 1]);
    });

    arr.forEach(card => {
      str += `• ${card[0]} x${card[1]}\n`;
    });

    msg.embed(
      new MessageEmbed()
        .setTitle('Sent in DM')
        .setDescription('Please check your DM')
        .setColor('#2196f3')
    );
    msg.member.send(
      new MessageEmbed()
        .setTitle('Reserve Cards')
        .setDescription(str)
        .setColor('#2196f3')
    );
  }
};
