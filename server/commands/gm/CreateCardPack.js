//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const { getCardPackEmbedByName } = require('../../helpers/cards');
const gameMasters = require('../../config/gameMasters');

//Init
const CardPack = mongoose.model('CardPack');

//Main
module.exports = class CreateCardPackCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'createcardpack',
      guildOnly: true,
      aliases: [],
      group: 'gm',
      memberName: 'createcardpack',
      description: 'Create a new card pack',
      examples: ['createCardPack'],
      args: [
        {
          key: 'name',
          prompt: 'What should be the name of this card pack?',
          type: 'string'
        },
        {
          key: 'description',
          prompt: 'Describe the card pack in less than 120 characters',
          type: 'string',
          max: 120
        },
        {
          key: 'tier',
          prompt: 'What should be the tier of this card pack?',
          type: 'integer',
          min: 1,
          max: 5
        },
        {
          key: 'cards',
          prompt: 'What should be number of cards in this card pack?',
          type: 'integer',
          min: 1,
          max: 30
        },
        {
          key: 'type',
          prompt:
            'Which type of cards should be available in this card pack? (character, all)',
          type: 'string'
        },
        {
          key: 'probability',
          prompt:
            'Describe probabilty of getting different tier cards? (eg: 50, 30, 20, 15, 5 would mean 50% chances of common, 30% uncommon, 20% rare, 15% epic, 5% legendary)',
          type: 'string'
        },
        {
          key: 'price',
          prompt: 'What should be the price of this card pack?',
          type: 'integer'
        },
        {
          key: 'discount',
          prompt:
            'Discount on this card pack? (0 - 80, 0 being 0% discount and 80 being 80% off)',
          type: 'integer',
          min: 0,
          max: 80
        },
        {
          key: 'guaranteedTier',
          prompt:
            "Which tier's card should be guaranteed? (0 for no guaranteed cards)",
          type: 'integer'
        },
        {
          key: 'stock',
          prompt:
            'What should be the amount of stock for this card pack? (-1 for infinity)',
          type: 'integer'
        }
      ]
    });
  }

  hasPermission(msg) {
    if (!_.includes(gameMasters, msg.member.id))
      return 'Only GMs can execute this command';
    else return true;
  }

  async run(
    msg,
    {
      name,
      description,
      tier,
      cards,
      type,
      probability,
      price,
      discount,
      guaranteedTier,
      stock
    }
  ) {
    const existingCardPack = await CardPack.findOne({ name }).exec();

    if (existingCardPack)
      return msg.embed(
        new MessageEmbed()
          .setTitle('Card pack already exists')
          .setDescription(
            'The card pack that you are trying to make already exists'
          )
          .setColor('#2196f3')
      );

    const probArr = probability
      .split(',')
      .map(prob => _.lowerCase(prob.trim()));

    await new CardPack({
      name: name.trim(),
      description,
      cards,
      type,
      tier,
      probability: {
        1: probArr[0] / 100,
        2: probArr[1] / 100,
        3: probArr[2] / 100,
        4: probArr[3] / 100,
        5: probArr[4] / 100
      },
      price,
      discount: discount / 100,
      stock,
      guaranteedTier
    }).save();

    msg.embed(await getCardPackEmbedByName(name));
  }
};
