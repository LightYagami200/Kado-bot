//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const { getLeagueName } = require('../../helpers/league');
const { expToNextLevel } = require('../../helpers/levels');

//Init
const Profile = mongoose.model('Profile');

//Main
module.exports = class ProfileCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'profile',
      guildOnly: true,
      aliases: ['p'],
      group: 'profile',
      memberName: 'profile',
      description: 'View your profile or someone elses profile',
      examples: ['profile', 'profile @someone'],
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'player',
          prompt: "Which player's profile do you want to view?",
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

    if (
      _.includes(
        require('../../config/gameMasters'),
        player ? player.id : msg.member.id
      ) &&
      process.env.NODE_ENV === 'production'
    )
      return msg.embed(
        new RichEmbed()
          .setTitle(`${player ? player.displayName : msg.member.displayName}`)
          .setDescription('Game Master')
          .setColor('#2196f3')
      );

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
      .setTitle(player ? player.displayName : msg.member.displayName)
      .setDescription(`${getLeagueName(profile.league)}`)
      .addField('Level', `${profile.level}`)
      .addField(
        'Exp',
        `${profile.level < 100 ? profile.exp : 'Max'} ${
          profile.level < 100
            ? '(' +
              expToNextLevel(profile.level, profile.exp) +
              ' Exp to level up)'
            : ''
        }`
      )
      .addField('Coins', `${profile.coins}`)
      .setColor('#2196f3');
    if (profile.equippedBadge) profileEmbed.setFooter(profile.equippedBadge);

    msg.embed(profileEmbed);
  }
};
