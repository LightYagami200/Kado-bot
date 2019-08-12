//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const Fuse = require('fuse.js');
const { nextTurn, dealDamage, endDuel } = require('../../helpers/duel');

//Init
const Duel = mongoose.model('Duel');
const Character = mongoose.model('Character');

//Main
module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      guildOnly: true,
      aliases: [],
      group: 'duel',
      memberName: 'play',
      description: 'Play a card',
      examples: ['play'],
      throttling: {
        usages: 1,
        duration: 3
      },
      args: [
        {
          key: 'type',
          prompt: 'Which type of card do you want to play?',
          type: 'string',
          oneOf: ['character']
        },
        {
          key: 'cardName',
          prompt: "What's the name of the card you want to use?",
          type: 'string'
        }
      ]
    });
  }

  async run(msg, { type, cardName }) {
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
          .setTitle("Can't play card")
          .setDescription("You can't use this command on someone else's turn")
          .setColor('#f44336')
      );

    if (duel.currentPhase === 'Drawing')
      return msg.embed(
        new RichEmbed()
          .setTitle("Can't play card")
          .setDescription("You can't use this command while drawing a card")
          .setColor('#f44336')
      );

    //Playing a card
    //->If a character card is played
    if (type === 'character') {
      //Finding index of card
      let index;

      //Configuring Search
      const fuse = new Fuse(
        duel.player1ID === msg.member.id ? duel.player1Hand : duel.player2Hand,
        { keys: ['cardName'], threshold: 0.2 }
      );

      //Searching
      const results = fuse.search(cardName);

      if (results.length === 0)
        return msg.embed(
          new RichEmbed()
            .setTitle('Card not found in hand')
            .setDescription(
              "The card you're trying to play doesn't exist in your hand"
            )
            .setColor('#f44336')
        );

      //Getting Index
      index = _.findIndex(
        duel.player1Hand,
        card => card.cardName === results[0].cardName
      );

      console.log(`index`, index, `\nresult`, results[0]);

      //Removing card from current player's hand
      if (duel.player1ID === msg.member.id) duel.player1Hand.splice(index, 1);
      else duel.player2Hand.splice(index, 1);

      //Play card
      const card = await Character.findOne({
        name: results[0].cardName
      }).exec();

      duel[`player${duel.player1ID === msg.member.id ? '1' : '2'}Card`] = {
        isEmpty: false,
        name: card.name,
        attack: card.attack,
        defense: card.defense,
        attributes: card.attributes
      };

      //Saving updated duel document
      await duel.save();

      //Sending message to notify that a card has been played
      msg.embed(
        new RichEmbed()
          .setTitle(`Card Played`)
          .setDescription(
            `${msg.guild.members.get(duel.currentTurn).displayName} played **${
              card.name
            }**`
          )
          .setColor('#2196f3')
      );
    }

    //Attacking
    const res = dealDamage(
      duel.currentTurn === duel.player1ID ? duel.player1Card : duel.player2Card,
      duel.currentTurn === duel.player1ID ? duel.player2Card : duel.player1Card
    );

    duel[`player${duel.player1ID === msg.member.id ? '1' : '2'}Card`] =
      res.offensiveCard;
    duel[`player${duel.player1ID === msg.member.id ? '2' : '1'}Card`] =
      res.defensiveCard;

    if (res.status === 'damage') {
      duel[`player${duel.player1ID === msg.member.id ? '2' : '1'}Health`] -=
        res.healthMinus;

      await msg.embed(
        new RichEmbed()
          .setTitle(`Damage Dealt!`)
          .setDescription(
            `${msg.guild.members.get(duel.currentTurn).displayName} dealt ${
              duel[
                `player${duel.player1ID === msg.member.id ? '2' : '1'}Health`
              ] < 0
                ? res.healthMinus +
                  duel[
                    `player${
                      duel.player1ID === msg.member.id ? '2' : '1'
                    }Health`
                  ]
                : res.healthMinus
            } HP damage to ${
              msg.guild.members.get(
                duel.currentTurn === duel.player1ID
                  ? duel.player2ID
                  : duel.player1ID
              ).displayName
            }`
          )
          .setColor('#f44336')
      );

      if (
        duel[`player${duel.player1ID === msg.member.id ? '2' : '1'}Health`] <= 0
      ) {
        await duel.save();
        return endDuel(msg, false);
      }
    } else if (res.status === 'def') {
      await msg.embed(
        new RichEmbed()
          .setTitle(`Damage Dealt to Card!`)
          .setDescription(
            `${msg.guild.members.get(duel.currentTurn).displayName} dealt ${
              res.offensiveCard.attack
            } damage to ${
              msg.guild.members.get(
                duel.currentTurn === duel.player1ID
                  ? duel.player2ID
                  : duel.player1ID
              ).displayName
            }'s ${
              duel[`player${duel.player1ID === msg.member.id ? '2' : '1'}Card`]
                .name
            }`
          )
          .setColor('#f44336')
      );
    }

    await duel.save();

    //Next turn
    nextTurn(msg);
  }
};
