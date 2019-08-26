//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

//Init
const Partner = mongoose.model('Partner');

//Main
module.exports = class PartnersCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'partners',
      guildOnly: true,
      aliases: [],
      group: 'general',
      memberName: 'partners',
      description: 'View Partner Servers',
      examples: ['partners']
    });
  }

  async run(msg) {
    const partners = await Partner.find({}).exec();

    let guidsStr = '';

    if (partners.length === 0) guidsStr = '[No Partners Yet]';

    partners.forEach(partner => {
      guidsStr += `${
        this.client.guilds.get(partner.guildID) !== undefined
          ? this.client.guilds.get(partner.guildID) + '\n'
          : ''
      }`;
    });

    msg.embed(
      new MessageEmbed()
        .setTitle('Check your DM')
        .setDescription('List of partners has been sent to your DM')
        .setColor('#2196f3')
    );

    msg.member.send(
      new MessageEmbed()
        .setTitle('Partner')
        .setDescription(guidsStr)
        .setFooter('Use "join <server name>" to join a server')
        .setColor('#2196f3')
    );
  }
};
