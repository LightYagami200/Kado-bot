//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const gameMasters = require('../../config/gameMasters');

//Init
const BlacklistedGuild = mongoose.model('BlacklistedGuild');
const BlacklistedUser = mongoose.model('BlacklistedUser');

//Main
module.exports = class UnblacklistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unblacklist',
      guildOnly: true,
      aliases: [],
      group: 'gm',
      memberName: 'unblacklist',
      description: 'Remove a guild or a user from blacklist',
      examples: ['unblacklist'],
      args: [
        {
          key: 'type',
          prompt: 'What do you want to unblacklist? (guild/user)',
          type: 'string',
          oneOf: ['guild', 'user']
        },
        {
          key: 'id',
          prompt: "What's the ID of the guild/user that you're removing from blacklist?",
          type: 'string'
        }
      ]
    });
  }

  hasPermission(msg) {
    if (!_.includes(gameMasters, msg.member.id))
      return 'Only GMs can execute this command';
    else return true;
  }

  async run(msg, { type, id }) {
    let blackListed;

    if (type === 'guild')
      blackListed = await BlacklistedGuild.findOne({ guildID: id }).exec();
    else blackListed = await BlacklistedUser.findOne({ userID: id }).exec();

    if (!blackListed)
      return msg.embed(
        new RichEmbed()
          .setTitle('Not blacklisted')
          .setDescription(
            "The guild/user you're trying to unblacklist is isn't blacklisted"
          )
          .setColor('#f44336')
      );

    if (type === 'guild') {
      await BlacklistedGuild.deleteOne({guildID: id}).exec();
      require('../../inhibitors/blacklistedGuilds').remove(id);
    } else {
      await BlacklistedUser.deleteOne({userID: id}).exec();
      require('../../inhibitors/blacklistedUsers').remove(id);
    }

    msg.embed(
      new RichEmbed()
        .setTitle('Unblacklisted')
        .setDescription('Guild/User is removed from blacklist')
        .setColor('#2196f3')
    );
  }
};
