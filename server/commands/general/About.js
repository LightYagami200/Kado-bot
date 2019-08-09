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
          'Kādo bot is an Anime card collecting/dueling bot, to invite it to your server, use this link: \n\nhttps://discordapp.com/api/oauth2/authorize?client_id=582271366619725855&permissions=280640&scope=bot\n\nVersion 0.2.1 changelog:\n> Fixed critical bug\n> Fixed guide & about formatting\n\nVersion 0.2 changelog:\n> Added long awaited Trading feature\n> Players get 3 cards at the start of the duel (from their main deck) to give more choice to players\n> Added this command (about)\n> Bug fixes'
        )
        .setFooter('Version: 0.2.1')
        .setColor('#2196f3')
    );
  }
};
