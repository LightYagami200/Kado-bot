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
module.exports = class UpdateCharacterCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'updatecharacter',
      guildOnly: true,
      aliases: [],
      group: 'gm',
      memberName: 'updatecharacter',
      description: 'Update a character',
      examples: ['updateCharacer'],
      args: [
        {
          key: 'name',
          prompt: 'Enter the character name to update',
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
    const character = await Character.findOne({ name }).exec();

    if (!character)
      return msg.embed(
        new MessageEmbed()
          .setTitle('Character not found')
          .setDescription(
            'The character that you are trying to update does not exist'
          )
          .setColor('#2196f3')
      );

    if (!character[key])
      return msg.embed(
        new MessageEmbed()
          .setTitle('Invalid Field')
          .setDescription(
            'The field that you are trying to update does not exist'
          )
          .setColor('#2196f3')
      );

    character[key] = value;

    await character.save();

    msg.embed(await getCharacterEmbedByName(name));
  }
};
