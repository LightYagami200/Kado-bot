//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const Fuse = require('fuse.js');
const { getCharacterEmbedByName } = require('../../helpers/cards');
const redis = require('redis');
const bluebird = require('bluebird');

//Init
const Profile = mongoose.model('Profile');
const CardPack = mongoose.model('CardPack');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

//Main
module.exports = class PurchaseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'purchase',
      guildOnly: true,
      aliases: [],
      group: 'shop',
      memberName: 'puchase',
      description: 'Purchase a card pack',
      examples: ['purchase'],
      args: [
        {
          key: 'packName',
          prompt: 'Which card pack do you want to purchase?',
          type: 'string'
        }
      ]
    });
  }

  async run(msg, { packName }) {
    const profile = await Profile.findOne({
      memberID: msg.member.id
    }).exec();

    const cardPacks = await CardPack.find({}).exec();

    if (!profile)
      return msg.embed(
        new MessageEmbed()
          .setTitle("Profile doesn't exist")
          .setDescription(
            "Profile doesn't exist, use `register` command to register profile"
          )
          .setColor('#f44336')
      );

    const res = await client.existsAsync(`duelers:${msg.author.id}`);
    if (res != 0)
      return msg.embed(
        new MessageEmbed()
          .setTitle('In duel!')
          .setDescription(
            "You can't use this commmand while in the middle of a duel"
          )
          .setColor('#f44336')
      );

    const fuse = new Fuse(cardPacks, {
      keys: ['name'],
      threshold: 0.1
    });

    const results = fuse.search(packName);

    if (results.length > 1)
      return msg.embed(
        new MessageEmbed()
          .setTitle('Be more specific')
          .setDescription('Please be more specific')
          .setColor('#f44336')
      );

    if (results.length === 0)
      return msg.embed(
        new MessageEmbed()
          .setTitle('No Card Pack Found')
          .setDescription('No card pack was found, double check your spellings')
          .setColor('#f44336')
      );

    const cardPack = results[0];

    const response = await cardPack.purchase(msg.member.id);

    if (response.res === 'err')
      return msg.embed(
        new MessageEmbed()
          .setTitle(response.title)
          .setDescription(response.desc)
          .setColor('#f44336')
      );

    msg.embed(
      new MessageEmbed()
        .setTitle('Opening Pack')
        .setDescription('Card pack is being opened...')
        .setColor('#2196f3')
    );

    setTimeout(() => {
      response.cards.forEach(async card => {
        if (card.type === 'character')
          msg.embed(await getCharacterEmbedByName(card.name));
      });
    }, 3000);
  }
};
