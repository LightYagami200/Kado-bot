//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');

//Init
const Coupon = mongoose.model('Coupon');
const Profile = mongoose.model('Profile');

//Main
module.exports = class RedeemCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'redeem',
      guildOnly: false,
      aliases: [],
      group: 'shop',
      memberName: 'redeem',
      description: 'Redeem a coupon',
      examples: ['redeem'],
      args: [
        {
          key: 'couponCode',
          prompt: 'Enter code of coupon to redeem',
          type: 'string'
        }
      ]
    });
  }

  async run(msg, { couponCode }) {
    const coupon = await Coupon.findOne({ couponCode }).exec();
    const profile = await Profile.findOne({
      memberID: msg.author.id
    }).exec();

    if (!profile)
      return msg.embed(
        new RichEmbed()
          .setTitle("Profile doesn't exist")
          .setDescription(
            "Profile doesn't exist, use `register` command to register profile"
          )
          .setColor('#f44336')
      );

    if (!coupon)
      return msg.embed(
        new RichEmbed()
          .setTitle('Invalid Coupon Code')
          .setDescription("There's no coupon with the code you provided")
          .setColor('#f44336')
      );

    if (_.includes(coupon.usedBy, msg.author.id))
      return msg.embed(
        new RichEmbed()
          .setTitle('Already redeemed')
          .setDescription("You've already redeemed this coupon")
          .setColor('#f44336')
      );

    if (coupon.usedBy.length >= coupon.maxUses)
      return msg.embed(
        new RichEmbed()
          .setTitle('Used Maximum times')
          .setDescription('This coupon has been used maximum times')
          .setColor('#f44336')
      );

    //Redeeming Coupon
    profile.addCoins(coupon.coins);
    coupon.used(msg.author.id);

    msg.embed(
      new RichEmbed()
        .setTitle('Coupon Redeemed')
        .setDescription(
          `You've redeemed coupon \`${coupon.couponCode}\` and got **${
            coupon.coins
          } Coins**`
        )
        .setColor('#2196f3')
    );
  }
};
