//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const { getLeagueName } = require('../../helpers/league');

//Init
const Profile = mongoose.model('Profile');

//Main
module.exports = class StatsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stats',
      guildOnly: true,
      aliases: ['s'],
      group: 'profile',
      memberName: 'stats',
      description: 'View your stats or someone elses states',
      examples: ['stats', 'stats @someone'],
      args: [
        {
          key: 'player',
          prompt: "Which player's state do you want to view?",
          type: 'member',
          default: ''
        }
      ]
    });
  }

  async run(msg, { player }) {
    const profile = await Profile.findOne({
      memberID: player ? player.id : msg.member.id
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

    const profileEmbed = new RichEmbed()
      .setTitle(`${player.displayName}'s Stats`)
      .setDescription(`${getLeagueName(profile.league)}`)
      .addField(
        'Win/Lose Ratio',
        isNaN(profile.wins / profile.loses)
          ? 'Not calculatable yet'
          : isFinite(profile.wins / profile.loses)
          ? (profile.wins / profile.loses).toPrecision(2)
          : profile.wins
      )
      .addField('Wins', profile.wins)
      .addField('Loses', profile.loses)
      .addField(
        'League Points',
        `${profile.leaguePoints} (${100 * (profile.league + 1) -
          profile.leaguePoints} points to reach **${getLeagueName(
          profile.league + 1
        )}**)`
      )
      .setColor('#2196f3');

    if (profile.equippedBadge) profileEmbed.setFooter(profile.equippedBadge);

    msg.embed(profileEmbed);
  }
};
