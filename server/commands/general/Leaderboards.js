//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const { getLeagueName } = require('../../helpers/league');

//Init
const Profile = mongoose.model('Profile');

//Main
module.exports = class LeaderboardsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leaderboards',
      guildOnly: true,
      aliases: ['leaderboard', 'l'],
      group: 'general',
      memberName: 'leaderboards',
      description: 'View the leaderboards',
      examples: ['leaderboards']
    });
  }

  async run(msg) {
    const profiles = await Profile.find({})
      .sort({ leaguePoints: -1 })
      .limit(10)
      .exec();

    let leaderboardStr = '';

    profiles.forEach((profile, i) => {
      leaderboardStr += `${
        this.client.users.get(profile.memberID)
          ? this.client.users.get(profile.memberID).username
          : '[Left Kādo]'
      } - ${getLeagueName(profile.league)} (${profile.leaguePoints} LP) ${
        i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''
      }\n`;
    });

    msg.embed(
      new RichEmbed()
        .setTitle('Leaderboards')
        .setDescription(leaderboardStr)
        .setColor('#2196f3')
    );
  }
};
