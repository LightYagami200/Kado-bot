//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

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
      new RichEmbed()
        .setTitle('About Kādo Bot')
        .setDescription(
          'Kādo bot is an Anime card collecting/dueling bot, to invite it to your server, use this link: \n\nhttps://discordapp.com/api/oauth2/authorize?client_id=582271366619725855&permissions=280640&scope=bot'
        )
        .setFooter('Version: 0.2')
        .setColor('#2196f3')
    );
  }
};
