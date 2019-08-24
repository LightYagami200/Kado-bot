//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const gameMasters = require('../../config/gameMasters');

//Init
const BlacklistedGuild = mongoose.model('BlacklistedGuild');
const BlacklistedUser = mongoose.model('BlacklistedUser');

//Main
module.exports = class ViewBlacklistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'viewblacklist',
      guildOnly: true,
      aliases: [],
      group: 'gm',
      memberName: 'viewblacklist',
      description: 'View blacklisted guilds/users',
      examples: ['viewBlacklist'],
      args: [
        {
          key: 'type',
          prompt: 'Which blacklist do you want to view? (guild/user)',
          type: 'string',
          oneOf: ['guild', 'user']
        },
        {
          key: 'limit',
          prompt: 'Enter maximum guilds/users to show',
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
        }
      ]
    });
  }

  hasPermission(msg) {
    if (!_.includes(gameMasters, msg.member.id))
      return 'Only GMs can execute this command';
    else return true;
  }

  async run(msg, { type, limit, page }) {
    let blacklist,
      str = '';

    if (type === 'guild')
      blacklist = await BlacklistedGuild.find({})
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();
    else
      blacklist = await BlacklistedUser.find({})
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();

    if (blacklist.length === 0) str = `[No blacklisted ${type}s found]`;

    if (type === 'guild')
      blacklist.forEach(
        blacklisted => (str += `${blacklisted.guildID} - ${blacklisted.reason}`)
      );
    else
      blacklist.forEach(
        blacklisted => (str += `${blacklisted.userID} - ${blacklisted.reason}`)
      );

    msg.embed(
      new MessageEmbed()
        .setTitle(`Blacklisted ${_.capitalize(type)}s`)
        .setDescription(str)
        .setColor('#2196f3')
    );
  }
};
