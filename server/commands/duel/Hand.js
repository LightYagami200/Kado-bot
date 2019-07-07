//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');

//Init
const Duel = mongoose.model('Duel');

//Main
module.exports = class HandCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hand',
      aliases: [],
      group: 'duel',
      guildOnly: true,
      memberName: 'hand',
      description: 'View cards available in your hand',
      examples: ['hand'],
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
          .setTitle("Can't view hand")
          .setDescription("You can't use this command on someone else's turn")
          .setColor('#f44336')
      );

    if (duel.currentPhase === 'Drawing')
      return msg.embed(
        new RichEmbed()
          .setTitle("Can't view hand")
          .setDescription("You can't use this command while drawing a card")
          .setColor('#f44336')
      );

    let handStr = '';

    const hand =
      duel.player1ID === msg.member.id ? duel.player1Hand : duel.player2Hand;

    if (hand.length)
      hand.forEach(card => {
        handStr += `- ${card.cardName}\n`;
      });
    else handStr = 'Empty hand';

    msg.embed(
      new RichEmbed()
        .setTitle('Sent in DM')
        .setDescription('Please check your DM')
        .setColor('#2196f3')
    );

    msg.member.send(
      new RichEmbed()
        .setTitle('Current Hand')
        .setDescription(handStr)
        .setColor('#2196f3')
    );
  }
};
