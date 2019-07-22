//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const gameMasters = require('../../config/gameMasters');

//Init
const Partner = mongoose.model('Partner');

//Main
module.exports = class AddPartnerCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'addpartner',
      guildOnly: true,
      aliases: [],
      group: 'gm',
      memberName: 'addpartner',
      description: 'Add a new Partner Guild',
      examples: ['addPartner'],
      args: [
        {
          key: 'guildID',
          prompt:
            "What's the ID of the guild that you're partnering with? (18 Digits ID)",
          type: 'string'
        },
        {
          key: 'inviteLink',
          prompt: "What's the invite Link to that guild?",
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

  async run(msg, { guildID, inviteLink }) {
    if (guildID === '556442896719544320' || guildID === '582529974754476042')
      return msg.embed(
        new MessageEmbed()
          .setTitle("Can't partner with self")
          .setDescription("Kādo bot can't partner with it's own parent server")
          .setColor('#f44336')
      );

    const partner = await Partner.findOne({ guildID }).exec();

    if (partner)
      return msg.embed(
        new MessageEmbed()
          .setTitle('Already Partnered')
          .setDescription(
            "The server you're trying to partner is already one of the partners"
          )
          .setColor('#f44336')
      );

    if (!this.client.guilds.get(guildID))
      return msg.embed(
        new MessageEmbed()
          .setTitle('Not in server')
          .setDescription(
            "Kādo bot isn't in the server you're trying to partner with"
          )
          .setColor('#f44336')
      );

    //Partnering
    await new Partner({
      guildID,
      inviteLink
    }).save();

    msg.embed(
      new MessageEmbed()
        .setTitle('Partner Added')
        .setDescription(
          `New partner \`${this.client.guilds.get(guildID).name}\` is added`
        )
        .setColor('#2196f3')
    );
  }
};
