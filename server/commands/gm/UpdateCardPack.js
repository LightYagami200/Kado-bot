//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const { getCardPackEmbedByName } = require('../../helpers/cards');
const gameMasters = require('../../config/gameMasters');

//Init
const CardPack = mongoose.model('CardPack');

//Main
module.exports = class UpdateCardPackCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'updatecardpack',
      guildOnly: true,
      aliases: [],
      group: 'gm',
      memberName: 'updatecardpack',
      description: 'Update a card pack',
      examples: ['updateCardPack'],
      args: [
        {
          key: 'name',
          prompt: 'Enter the name of card pack to update',
          type: 'string'
        },
        {
          key: 'key',
          prompt: 'Enter the field to update',
          type: 'string',
          max: 240
        },
        {
          key: 'value',
          prompt: 'Enter the new value for the specified field',
          type: 'string',
          max: 240
        }
      ]
    });
  }

  hasPermission(msg) {
    if (!_.includes(gameMasters, msg.member.id))
      return 'Only GMs can execute this command';
    else return true;
  }

  async run(msg, { name, key, value }) {
    const cardPack = await CardPack.findOne({ name }).exec();

    if (!cardPack)
      return msg.embed(
        new MessageEmbed()
          .setTitle('Card pack not found')
          .setDescription(
            'The card pack that you are trying to update does not exist'
          )
          .setColor('#2196f3')
      );

    if (typeof cardPack[key] === 'undefined')
      return msg.embed(
        new MessageEmbed()
          .setTitle('Invalid Field')
          .setDescription(
            'The field that you are trying to update does not exist'
          )
          .setColor('#2196f3')
      );

    cardPack[key] = value;

    await cardPack.save();

    msg.embed(await getCardPackEmbedByName(name));
  }
};
