//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const { getCharacterEmbedByName } = require('../../helpers/cards');
const gameMasters = require('../../config/gameMasters');

//Init
const Character = mongoose.model('Character');

//Main
module.exports = class GetCardsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'getcards',
      guildOnly: true,
      aliases: [],
      group: 'gm',
      memberName: 'getcards',
      description: 'Get all cards or cards of an specific tier',
      examples: [
        'getCards',
        'getCards character',
        'getCards character 10',
        'getCards character 15 1 tier 2'
      ],
      args: [
        {
          key: 'type',
          prompt: 'Enter type of cards to view? (character)',
          type: 'string'
        },
        {
          key: 'limit',
          prompt: 'Enter maximum cards to show',
          type: 'integer',
          min: 1,
          max: 20
        },
        {
          key: 'page',
          prompt: 'Enter page to show',
          type: 'integer',
          min: 1,
          default: 1
        },
        {
          key: 'key',
          prompt: 'What do you want to filter cards by? (tier, attributes)',
          type: 'string',
          default: ''
        },
        {
          key: 'value',
          prompt: 'Enter value to filter cards by',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  hasPermission(msg) {
    if (!_.includes(gameMasters, msg.member.id))
      return 'Only GMs can execute this command';
    else return true;
  }

  async run(msg, { type, limit, page, key, value }) {
    switch (type) {
      case 'character': {
        let characters;
        if (!key) characters = await Character.find({}, null, { limit }).exec();
        else
          characters = await Character.find({ [key]: value }, null, {
            limit,
            skip: (page - 1) * limit
          }).exec();

        if (!characters)
          return msg.embed(
            new RichEmbed()
              .setTitle('No cards found')
              .setDescription(
                "The card(s) that you're looking for weren't found"
              )
          );

        characters.forEach(async character => {
          msg.embed(await getCharacterEmbedByName(character.name));
        });

        break;
      }
      default:
        msg.embed(
          new RichEmbed()
            .setTitle('Invalid type')
            .setDescription('Type is invalid, valid types are `character`')
            .setColor('#f44336')
        );
    }
  }
};
