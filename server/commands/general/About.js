//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

//Main
module.exports = class LeaderboardsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'about',
      guildOnly: false,
      aliases: ['about'],
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
          'Kādo bot is an Anime card collecting/dueling bot, to invite it to your server, use this link: \n\nhttps://discordapp.com/api/oauth2/authorize?client_id=582271366619725855&permissions=280640&scope=bot\n\nVersion 0.3.0.1 Changelog\n> Fixed partners command bug\n> Fixed Website CSS\n\nVersion 0.3 Changelog\n> Completely revamped attributes\n> Re-wrote the whole guide (took me whole 2 hours, So I hope it helps you)\n> Redesigned move command to make it user-friendly (dw tho, old command is still here but renamed to moveOld)\n> Major performance improvements\n> Fixed bugs'
        )
        .setFooter('Version: 0.3')
        .setColor('#2196f3')
    );
  }
};
