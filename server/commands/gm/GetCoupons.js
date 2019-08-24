//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const gameMasters = require('../../config/gameMasters');

//Init
const Coupon = mongoose.model('Coupon');

//Main
module.exports = class GetCardsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'getcoupons',
      guildOnly: true,
      aliases: [],
      group: 'gm',
      memberName: 'getcoupons',
      description: 'Get all coupons',
      examples: ['getCoupons'],
      args: [
        {
          key: 'limit',
          prompt: 'Enter maximum coupons to show',
          type: 'integer',
          min: 1,
          max: 20
        },
        {
          key: 'page',
          prompt: 'Enter page to show',
          type: 'integer',
          min: 1,
          default: 1
        },
        {
          key: 'key',
          prompt: 'What do you want to filter coupons by? (coins, maxUses)',
          type: 'string',
          default: ''
        },
        {
          key: 'value',
          prompt: 'Enter value to filter coupons by',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  hasPermission(msg) {
    if (!_.includes(gameMasters, msg.member.id))
      return 'Only GMs can execute this command';
    else return true;
  }

  async run(msg, { limit, page, key, value }) {
    let coupons;

    if (!key) coupons = await Coupon.find({}, null, { limit }).exec();
    else
      coupons = await Coupon.find({ [key]: value }, null, {
        limit,
        skip: (page - 1) * limit
      }).exec();

    if (!coupons)
      return msg.embed(
        new MessageEmbed()
          .setTitle('No coupon(s) found')
          .setDescription("The coupon(s) that you're looking for weren't found")
      );

    let couponsStr = '';

    coupons.forEach(coupon => {
      couponsStr += `${coupon.couponCode} - ${coupon.coins} Coins (Used: ${
        coupon.usedBy.length
      }/${coupon.maxUses})\n`;
    });

    msg.embed(
      new MessageEmbed()
        .setTitle('Coupons')
        .setDescription(couponsStr)
        .setColor('#2196f3')
    );
  }
};
