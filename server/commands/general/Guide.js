//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const paginationEmbed = require('discord.js-pagination');

//Main
module.exports = class LeaderboardsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'guide',
      guildOnly: false,
      aliases: ['guide'],
      group: 'general',
      memberName: 'guide',
      description: 'View Guide',
      examples: ['guide']
    });
  }

  async run(msg) {
    const pages = [
      new RichEmbed({
        title: 'Contents of Guide',
        description:
          '1) Getting Started\n2) Card Tiers\n3) Dueling\n4) Attributes\n5) Misc',
        color: '#2196f3'
      })
    ];

    paginationEmbed(msg, pages, ['⏪', '⏩'], 600000);
  }
};
