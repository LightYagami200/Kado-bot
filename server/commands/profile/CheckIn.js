//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

//Init
const Profile = mongoose.model('Profile');

//Main
module.exports = class CheckInCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'checkin',
      guildOnly: true,
      aliases: [],
      group: 'profile',
      memberName: 'checkin',
      description: 'Check in daily to earn rewards',
      examples: ['checkIn']
    });
  }

  async run(msg) {
    const profile = await Profile.findOne({
      memberID: msg.member.id
    }).exec();

    if (!profile)
      return msg.embed(
        new MessageEmbed()
          .setTitle("Profile doesn't exist")
          .setDescription(
            "Profile doesn't exist, use `register` command to register profile"
          )
          .setColor('#f44336')
      );

    const res = await profile.checkIn();

    if (!res)
      msg.embed(
        new MessageEmbed()
          .setTitle('Already Checked In')
          .setDescription(
            'You have already checked in today, come back tommorow'
          )
          .setColor('#f44336')
      );
    else
      msg.embed(
        new MessageEmbed()
          .setTitle('Checked In')
          .setDescription(res)
          .setColor('#2196f3')
      );
  }
};
