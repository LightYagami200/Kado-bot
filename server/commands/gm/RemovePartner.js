//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const gameMasters = require('../../config/gameMasters');

//Init
const Partner = mongoose.model('Partner');

//Main
module.exports = class RemovePartnerCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'removepartner',
      guildOnly: true,
      aliases: [],
      group: 'gm',
      memberName: 'removepartner',
      description: 'Add a new Partner Guild',
      examples: ['removePartner'],
      args: [
        {
          key: 'guildID',
          prompt:
            "What's the ID of the guild that you're removing from partners? (18 Digits ID)",
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

  async run(msg, { guildID }) {
    if (guildID === '556442896719544320' || guildID === '582529974754476042')
      return msg.embed(
        new RichEmbed()
          .setTitle("Can't remove")
          .setDescription("Kādo bot can't remove it's own parent server")
          .setColor('#f44336')
      );

    const partner = await Partner.findOne({ guildID }).exec();

    if (!partner)
      return msg.embed(
        new RichEmbed()
          .setTitle('Not a partner')
          .setDescription(
            "The server you're trying to remove isn't one of the partners"
          )
          .setColor('#f44336')
      );

    //Removing Parnter
    await Partner.deleteOne({ guildID }).exec();

    msg.embed(
      new RichEmbed()
        .setTitle('Partner Removed')
        .setDescription(`Server was removed from partners`)
        .setColor('#2196f3')
    );
  }
};
