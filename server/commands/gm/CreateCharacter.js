//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const { getCharacterEmbedByName } = require('../../helpers/cards');
const gameMasters = require('../../config/gameMasters');

//Init
const Character = mongoose.model('Character');

//Main
module.exports = class CreateCharacterCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'createcharacter',
      guildOnly: true,
      aliases: [],
      group: 'gm',
      memberName: 'createcharacter',
      description: 'Create a new Character card',
      examples: ['createCharacter'],
      args: [
        {
          key: 'name',
          prompt: 'What should be the name of character?',
          type: 'string'
        },
        {
          key: 'description',
          prompt: 'Describe the character in less than 240 characters',
          type: 'string',
          max: 240
        },
        {
          key: 'pictureUrl',
          prompt: 'Provide URL to the picture of this character',
          type: 'string'
        },
        {
          key: 'tier',
          prompt: 'What should be the tier of the character card?',
          type: 'integer',
          min: 1,
          max: 5
        },
        {
          key: 'attack',
          prompt: 'What should be the ATK of this character?',
          type: 'integer'
        },
        {
          key: 'defense',
          prompt: 'What should be the DEF of this character?',
          type: 'integer'
        },
        {
          key: 'attributes',
          prompt:
            'What should be the attributes of this character? (comma seperated list)',
          type: 'string'
        },
        {
          key: 'stock',
          prompt:
            'What should be the amount of stock for this character? (common/uncommon are not affected)',
          type: 'integer',
          min: 1,
          max: 1000
        }
      ]
    });
  }

  hasPermission(msg) {
    if (!_.includes(gameMasters, msg.member.id))
      return 'Only GMs can execute this command';
    else return true;
  }

  async run(
    msg,
    { name, description, pictureUrl, tier, attack, defense, attributes, stock }
  ) {
    const existingCharacter = await Character.findOne({ name }).exec();

    if (existingCharacter)
      return msg.embed(
        new MessageEmbed()
          .setTitle('Character already exists')
          .setDescription(
            'The character that you are trying to make already exists'
          )
          .setColor('#2196f3')
      );

    await new Character({
      name: _.startCase(name.trim()),
      description,
      pictureUrl,
      tier,
      attack,
      defense,
      attributes: attributes.split(',').map(item => _.lowerCase(item.trim())),
      stock: tier <= 2 ? -1 : stock,
      sold: 0
    }).save();

    msg.embed(await getCharacterEmbedByName(name));
  }
};
