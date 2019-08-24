//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const randomstring = require('randomstring');
const gameMasters = require('../../config/gameMasters');

//Init
const Coupon = mongoose.model('Coupon');

//Main
module.exports = class CreateCouponCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'createcoupon',
      guildOnly: true,
      aliases: [],
      group: 'gm',
      memberName: 'createcoupon',
      description: 'Create new Coupon(s)',
      examples: ['createCoupon'],
      args: [
        {
          key: 'coins',
          prompt: 'How many coins should this coupon provide?',
          type: 'integer',
          min: 10,
          max: 100000
        },
        {
          key: 'maxUses',
          prompt: 'How many times should this coupon be used? (Max uses)',
          type: 'integer',
          min: 1,
          max: 10000
        },
        {
          key: 'code',
          prompt: 'What should be the code of this coupon? (Optional)',
          type: 'string',
          default: ''
        },
        {
          key: 'amountToGenerate',
          prompt: 'How many coupons to generate?',
          type: 'integer',
          min: 1,
          max: 1000,
          default: 1
        }
      ]
    });
  }

  hasPermission(msg) {
    if (!_.includes(gameMasters, msg.member.id))
      return 'Only GMs can execute this command';
    else return true;
  }

  async run(msg, { coins, maxUses, code, amountToGenerate }) {
    const existingCoupon = await Coupon.findOne({ couponCode: code }).exec();

    if (existingCoupon)
      return msg.embed(
        new MessageEmbed()
          .setTitle('Coupon with this code already exists')
          .setDescription(
            "The code you're trying to use is already in use by another coupon"
          )
          .setColor('#2196f3')
      );

    let codes = '';

    if (amountToGenerate > 1)
      for (var i = 1; i <= amountToGenerate; i++)
        codes += `${
          (await this.generateCoupon(
            coins,
            maxUses,
            randomstring.generate({
              length: 8,
              charset: 'alphamumeric',
              readable: true,
              capitalization: 'uppercase'
            })
          )).couponCode
        }\n`;
    else
      codes += `${
        (await this.generateCoupon(
          coins,
          maxUses,
          code
            ? code
            : randomstring.generate({
                length: 8,
                charset: 'alphamumeric',
                readable: true,
                capitalization: 'uppercase'
              })
        )).couponCode
      }\n`;

    msg.embed(
      new MessageEmbed()
        .setTitle('Coupon code(s) generated')
        .setDescription(`Coupon(s):\n${codes}`)
        .setColor('#2196f3')
    );
  }

  async generateCoupon(coins, maxUses, code) {
    return await new Coupon({
      couponCode: code,
      maxUses,
      coins,
      usedBy: []
    }).save();
  }
};
