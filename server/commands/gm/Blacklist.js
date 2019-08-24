//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const gameMasters = require('../../config/gameMasters');

//Init
const BlacklistedGuild = mongoose.model('BlacklistedGuild');
const BlacklistedUser = mongoose.model('BlacklistedUser');
const Partner = mongoose.model('Partner');

//Main
module.exports = class BlacklistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'blacklist',
      guildOnly: true,
      aliases: [],
      group: 'gm',
      memberName: 'blacklist',
      description: 'Blacklist a guild or a user',
      examples: ['blacklist'],
      args: [
        {
          key: 'type',
          prompt: 'What do you want to blacklist? (guild/user)',
          type: 'string',
          oneOf: ['guild', 'user']
        },
        {
          key: 'id',
          prompt: "What's the ID of the guild/user that you're blacklisting?",
          type: 'string'
        },
        {
          key: 'reason',
          prompt: "What's the reason for blacklisting this guild/user?",
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

  async run(msg, { type, id, reason }) {
    const partner = await Partner.findOne({ guildID: id }).exec();

    if (
      id === '556442896719544320' ||
      id === '582529974754476042' ||
      _.includes(gameMasters, id) ||
      _.includes(this.client.owners, id) ||
      partner
    )
      return msg.embed(
        new MessageEmbed()
          .setTitle("Can't blacklist core servers/GMs/partners")
          .setDescription(
            "The guild/user you're trying to blacklist can't be blacklisted"
          )
          .setColor('#f44336')
      );

    let blackListed;

    if (type === 'guild')
      blackListed = await BlacklistedGuild.findOne({ guildID: id }).exec();
    else blackListed = await BlacklistedUser.findOne({ userID: id }).exec();

    if (blackListed)
      return msg.embed(
        new MessageEmbed()
          .setTitle('Already blacklisted')
          .setDescription(
            "The guild/user you're trying to blacklist is already blacklisted"
          )
          .setColor('#f44336')
      );

    if (type === 'guild') {
      await new BlacklistedGuild({
        guildID: id,
        reason
      }).save();
      require('../../inhibitors/blacklistedGuilds').add(id);
    } else {
      await new BlacklistedUser({
        userID: id,
        reason
      }).save();
      require('../../inhibitors/blacklistedUsers').add(id);
    }

    msg.embed(
      new MessageEmbed()
        .setTitle('Blacklisted')
        .setDescription('Guild/User blacklisted')
        .setColor('#2196f3')
    );
  }
};
