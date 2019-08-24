//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const { getCardPackEmbedByName } = require('../../helpers/cards');

//Init
const CardPack = mongoose.model('CardPack');

//Main
module.exports = class ShopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shop',
      guildOnly: true,
      aliases: [],
      group: 'shop',
      memberName: 'shop',
      description: 'View shop',
      examples: ['shop'],
      args: [
        {
          key: 'page',
          prompt: 'Page to view',
          type: 'integer',
          default: 1
        }
      ]
    });
  }

  async run(msg, { page }) {
    const cardPacks = await CardPack.find({}, null, {
      skip: 10 * (page - 1)
    }).exec();

    if (cardPacks.length < 1)
      return msg.embed(
        new MessageEmbed()
          .setTitle('No card packs...')
          .setDescription('No card packs on this page')
          .setColor('#f44336')
      );

    cardPacks.forEach(async cardPack => {
      if (cardPack.stock === 0) return;
      msg.embed(await getCardPackEmbedByName(cardPack.name));
    });
  }
};
