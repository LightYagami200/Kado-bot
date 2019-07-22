//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const { performance } = require('perf_hooks');
const client = require('redis').createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

//Init

//Main
module.exports = class RedisCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'servers',
      aliases: [],
      group: 'stats',
      memberName: 'servers',
      ownerOnly: true,
      throttling: {
        usages: 1,
        duration: 2
      },
      description: 'Get total amount of servers this bot is in',
      examples: ['servers']
    });
  }

  async run(msg) {
    msg.embed(
      new RichEmbed()
        .setTitle('Servers')
        .setDescription(
          `Aldovia bot is in **${this.client.guilds.size}** Servers`
        )
        .setColor('#2196f3')
    );
  }
};
