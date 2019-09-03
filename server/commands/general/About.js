//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

//Main
module.exports = class LeaderboardsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'about',
      guildOnly: false,
      aliases: ['about', 'info', 'changelog'],
      group: 'general',
      memberName: 'about',
      description: 'About Kado Bot',
      examples: ['about']
    });
  }

  async run(msg) {
    msg.embed(
      new MessageEmbed()
        .setTitle('About Kādo Bot')
        .setDescription(
          'Kādo bot is an Anime card collecting/dueling bot, to invite it to your server, use this link: \n\nhttps://discordapp.com/api/oauth2/authorize?client_id=582271366619725855&permissions=280640&scope=bot\n\nVersion 0.3.2 Changelog\n> Updated checkIn Message\n> Added "Low on Coins?" message when you have less than 100 coins\n> Minor changes\n\nVersion 0.3.1 Changelog\n> Increased guide timer\n> Increased move command timer\n> Added patrons\n> Fixed major bugs\n\nVersion 0.3.0.2 Changelog\n> Removed annoying "Unknown Command" message\n> Minor changes\n\nVersion 0.3.0.1 Changelog\n> Fixed partners command bug\n> Fixed Website CSS\n\nVersion 0.3 Changelog\n> Completely revamped attributes\n> Re-wrote the whole guide (took me whole 2 hours, So I hope it helps you)\n> Redesigned move command to make it user-friendly (dw tho, old command is still here but renamed to moveOld)\n> Major performance improvements\n> Fixed bugs\n\nTHanks to our patrons who\'re supporting Kado:\n> AverageAtBest#8008'
        )
        .setFooter('Version: 0.3.2')
        .setColor('#2196f3')
    );
  }
};
