//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const { nextTurn } = require('../../helpers/duel');

//Init
const Duel = mongoose.model('Duel');

//Main
module.exports = class EndTurnCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'endturn',
      guildOnly: true,
      aliases: [],
      group: 'duel',
      memberName: 'endturn',
      description: 'End your current turn',
      examples: ['endTurn'],
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
          .setTitle("Can't end turn")
          .setDescription("You can't use this command on someone else's turn")
          .setColor('#f44336')
      );

    if (duel.currentPhase === 'Drawing')
      return msg.embed(
        new RichEmbed()
          .setTitle("Can't end turn")
          .setDescription("You can't use this command while drawing a card")
          .setColor('#f44336')
      );

    nextTurn(msg);
  }
};
