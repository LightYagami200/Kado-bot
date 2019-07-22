//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');

//Init
const Profile = mongoose.model('Profile');
const Deck = mongoose.model('Deck');

//Main
module.exports = class RegisterCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'register',
      guildOnly: true,
      aliases: ['r'],
      group: 'profile',
      memberName: 'register',
      description: 'Register a new profile',
      examples: ['register']
    });
  }

  async run(msg) {
    const profile = await Profile.findOne({ memberID: msg.member.id }).exec();

    if (
      _.includes(require('../../config/gameMasters'), msg.member.id) &&
      process.env.NODE_ENV === 'production'
    )
      return msg.embed(
        new RichEmbed()
          .setTitle('Cannot register profile')
          .setDescription(
            'Game masters cannot register profile outside of dev server'
          )
          .setColor('#f44336')
      );

    if (profile)
      return msg.embed(
        new RichEmbed()
          .setTitle('Profile already registered')
          .setDescription(
            'Your profile is already registered, use `profile` command to view your profile'
          )
          .setColor('#f44336')
      );

    await new Profile({
      memberID: msg.member.id,
      exp: 0,
      level: 1,
      badges: [],
      equippedBadge: '',
      coins: 20,
      cardPacks: [],
      wins: 0,
      loses: 0,
      league: 0,
      leaguePoints: 50
    }).save();

    await new Deck({
      memberID: msg.member.id,
      reserveCards: [],
      mainDeck: [],
      mainDeckSize: 10
    }).save();

    msg.embed(
      new RichEmbed()
        .setTitle('Profile registered')
        .setDescription(
          'Your profile has been registered, use `profile` command to view your profile'
        )
        .setColor('#2196f3')
    );
  }
};
