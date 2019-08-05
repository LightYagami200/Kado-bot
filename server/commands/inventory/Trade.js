//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const prompt = require('discordjs-prompter');
const _ = require('lodash');

//Init
const Profile = mongoose.model('Profile');
const Deck = mongoose.model('Deck');

//Main
module.exports = class LeaderboardsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'trade',
      guildOnly: true,
      aliases: ['trade'],
      group: 'inventory',
      memberName: 'trade',
      description:
        "Trade a card with another player, please note that only cards from RESERVE can be traded, if you wish to trade a card, make sure it's in your reserve",
      examples: [
        'trade',
        'trade @yeetus character "Saitama" character "Kirito"'
      ],
      args: [
        {
          key: 'tradeWith',
          prompt: 'Who do you want to trade card with?',
          type: 'member'
        },
        {
          key: 'typeToGive',
          prompt: 'Which type of card do you want to GIVE? (character)',
          type: 'string',
          oneOf: ['character']
        },
        {
          key: 'cardNameToGive',
          prompt: "What's the name of the card you want to GIVE?",
          type: 'string'
        },
        {
          key: 'typeToGet',
          prompt: 'Which type of card do you want to GET? (character)',
          type: 'string',
          oneOf: ['character']
        },
        {
          key: 'cardNameToGet',
          prompt: "What's the name of the card you want to GET?",
          type: 'string'
        }
      ]
    });
  }

  async run(
    msg,
    { tradeWith, typeToGive, cardNameToGive, typeToGet, cardNameToGet }
  ) {
    const profile = await Profile.findOne({
      memberID: msg.author.id
    }).exec();

    const withProfile = await Profile.findOne({
      memberID: tradeWith.id
    }).exec();

    if (!profile || !withProfile)
      return msg.embed(
        new RichEmbed()
          .setTitle("Profile doesn't exist")
          .setDescription(
            "You or the player you're trying to trade with doesn't have a profile, use `register` to register profile"
          )
          .setColor('#f44336')
      );

    const traderDeck = await Deck.findOne({ memberID: msg.member.id }).exec();
    const tradeWithDeck = await Deck.findOne({ memberID: tradeWith.id }).exec();

    let cardToGiveIndex = _.findIndex(
        traderDeck.reserveCards,
        card => card.cardName === cardNameToGive
      ),
      cardToGetIndex = _.findIndex(
        tradeWithDeck.reserveCards,
        card => card.cardName === cardNameToGet
      );

    if (cardToGiveIndex < 0)
      return msg.embed(
        new RichEmbed()
          .setTitle('Card not found')
          .setDescription(
            "The card you're trying to trade doesn't exist in your reserve"
          )
          .setColor('#f44336')
      );

    if (cardToGetIndex < 0)
      return msg.embed(
        new RichEmbed()
          .setTitle('Card not found')
          .setDescription(
            "The card you're trying to get doesn't exist in reserve of the player you're trying to trade with"
          )
          .setColor('#f44336')
      );

    //Prompt
    const res = await prompt.reaction(msg.channel, {
      question: `${tradeWith}, do you accept the trade?\nYour \`${cardNameToGet}\` for ${
        msg.member.displayName
      }'s \`${cardNameToGive}\``,
      userID: tradeWith.id
    });

    if (!res || res === 'no')
      return msg.embed(
        new RichEmbed()
          .setTitle('Trade rejected')
          .setDescription(`Trade was rejected by ${tradeWith.displayName}`)
          .setColor('#f44336')
      );

    //Trading Cards
    traderDeck.reserveCards.splice(cardToGiveIndex, 1);
    tradeWithDeck.reserveCards.splice(cardToGetIndex, 1);

    tradeWithDeck.reserveCards.push({
      cardType: typeToGive,
      cardName: cardNameToGive
    });

    traderDeck.reserveCards.push({
      cardType: typeToGet,
      cardName: cardNameToGet
    });

    //Save Deck
    await traderDeck.save();
    await tradeWithDeck.save();

    return msg.embed(
      new RichEmbed()
        .setTitle('Trade successfull')
        .setDescription('Trade was successfull')
        .setColor('#2196f3')
    );
  }
};
