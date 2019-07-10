//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');

//Init
const Partner = mongoose.model('Partner');

//Main
module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'join',
      aliases: [],
      group: 'general',
      memberName: 'join',
      description: 'View Partner Servers',
      examples: ['join', 'join Weeabu Internment Camp'],
      args: [
        {
          key: 'name',
          prompt: 'Enter name of partner you wish to join',
          type: 'string'
        }
      ]
    });
  }

  async run(msg, { name }) {
    const guild = this.client.guilds.find(guild => guild.name === name);

    const partner = await Partner.findOne({ guildID: guild.id }).exec();

    if (!partner)
      return msg.embed(
        new RichEmbed()
          .setTitle('Guild Not Found')
          .setDescription(
            "The partner you're trying to join doesn't exist. Please double check your spelling and capitalization"
          )
          .setColor('#f44336')
      );

    msg.reply(`The link is sent to your DM`);
    msg.member.send(
      `Use this link to join the Partner server: ${partner.inviteLink}`
    );
  }
};
