//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
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
      name: 'redis',
      aliases: [],
      group: 'stats',
      memberName: 'redis',
      ownerOnly: true,
      throttling: {
        usages: 1,
        duration: 2
      },
      description: 'Check redis status',
      examples: ['redis']
    });
  }

  async run(msg) {
    const setTimeBefore = performance.now();
    await client.set('REDIS PING', 'DEFAULT');
    const setTimeOut = performance.now();

    const setTime = setTimeOut - setTimeBefore;

    const getTimeBefore = performance.now();
    await client.get('REDIS PING');
    const getTimeOut = performance.now();

    const getTime = getTimeOut - getTimeBefore;

    const deleteTimeBefore = performance.now();
    await client.del('REDIS PING');
    const deleteTimeOut = performance.now();

    const deleteTime = deleteTimeOut - deleteTimeBefore;

    msg.embed(
      new MessageEmbed()
        .setTitle('Redis Stats')
        .setDescription(
          `SET Time: ${setTime.toFixed(3)}ms\nGET Time: ${getTime.toFixed(
            3
          )}ms\nDEL Time: ${deleteTime.toFixed(3)}ms`
        )
        .setColor('#2196f3')
    );
  }
};
