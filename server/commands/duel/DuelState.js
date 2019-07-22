//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');

//Init
const Duel = mongoose.model('Duel');

//Main
module.exports = class DuelStateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'duelstate',
      aliases: ['ds', 'duelstat'],
      group: 'duel',
      guildOnly: true,
      memberName: 'duelstate',
      description: 'View current state of the duel',
      examples: ['duelState'],
      throttling: {
        usages: 1,
        duration: 10
      }
    });
  }

  async run(msg) {
    //Validate
    const duel = await Duel.findOne({
      $or: [{ player1ID: msg.member.id }, { player2ID: msg.member.id }]
    }).exec();

    if (!duel)
      return msg.embed(
        new RichEmbed()
          .setTitle('Not in a duel')
          .setDescription(
            "You can't use this command when you're not in a duel"
          )
          .setColor('#f44336')
      );

    if (duel.currentTurn !== msg.member.id)
      return msg.embed(
        new RichEmbed()
          .setTitle("Can't view duel state")
          .setDescription("You can't use this command on someone else's turn")
          .setColor('#f44336')
      );

    if (duel.currentPhase === 'Drawing')
      return msg.embed(
        new RichEmbed()
          .setTitle("Can't view duel state")
          .setDescription("You can't use this command while drawing a card")
          .setColor('#f44336')
      );

    msg.embed(
      new RichEmbed()
        .setTitle('Duel Stats')
        .addField(
          'Health',
          `${msg.guild.members.get(duel.player1ID).displayName}: ${
            duel.player1Health
          }\n${msg.guild.members.get(duel.player2ID).displayName}: ${
            duel.player2Health
          }`
        )
        .addField(
          'Cards',
          `${msg.guild.members.get(duel.player1ID).displayName}: ${
            duel.player1Card.name
          } - ATK ${duel.player1Card.attack} / DEF ${
            duel.player1Card.defense
          }\n${msg.guild.members.get(duel.player2ID).displayName}: ${
            duel.player2Card.name
          } - ATK ${duel.player2Card.attack} / DEF ${duel.player2Card.defense}`
        )
        .setColor('#2196f3')
    );
  }
};
