//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const redis = require('redis');
const bluebird = require('bluebird');
const prompter = require('discordjs-prompter');
const uniqid = require('uniqid');
const { nextTurn, endDuel } = require('../../helpers/duel');
const { getCharacterEmbedByName } = require('../../helpers/cards');
const _ = require('lodash');

//Init
const Profile = mongoose.model('Profile');
const Deck = mongoose.model('Deck');
const Duel = mongoose.model('Duel');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

//Main
module.exports = class ChallengeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'challenge',
      guildOnly: true,
      aliases: ['c'],
      group: 'duel',
      memberName: 'challenge',
      description: 'Challenge someone to a duel',
      examples: ['challenge', 'challenge @someone', 'challenge @someone 10'],
      throttling: {
        usages: 3,
        duration: 60
      },
      args: [
        {
          key: 'player',
          prompt: 'Which player do you want to challenge?',
          type: 'member'
        },
        {
          key: 'amount',
          prompt: 'How much amount do you want to bet? (0 for friendly duel)',
          type: 'integer',
          min: 0
        }
      ]
    });
  }

  async run(msg, { player, amount }) {
    //Validate
    const profile = await Profile.findOne({
      memberID: msg.member.id
    }).exec();

    const opponentProfile = await Profile.findOne({
      memberID: player.id
    }).exec();

    if (!profile || !opponentProfile)
      return msg.embed(
        new MessageEmbed()
          .setTitle("Profile doesn't exist")
          .setDescription(
            "Your or the person you're trying to challenge doesn't have a profile, use `register` command to register profile"
          )
          .setColor('#f44336')
      );

    if (msg.member.id === player.id)
      return msg.embed(
        new MessageEmbed()
          .setTitle("Can't challenge yourself")
          .setDescription("You can't challenge yourself")
          .setColor('#f44336')
      );

    if (profile.coins < amount || opponentProfile.coins < amount)
      return msg.embed(
        new MessageEmbed()
          .setTitle('Not enough coins')
          .setDescription(
            "Your or the person you're trying to challenge doesn't have enough coins"
          )
          .setColor('#f44336')
      );

    const deck = await Deck.findOne({
      memberID: msg.member.id
    }).exec();

    if (deck.mainDeck.length < 3)
      return msg.embed(
        new MessageEmbed()
          .setTitle('Not enough cards in main deck')
          .setDescription(
            'You need at least 3 cards in main deck to duel someone'
          )
          .setColor('#f44336')
      );

    const opponentsDeck = await Deck.findOne({
      memberID: player.id
    }).exec();

    if (opponentsDeck.mainDeck.length < 3)
      return msg.embed(
        new MessageEmbed()
          .setTitle('Not enough cards in opponents deck')
          .setDescription(
            "The person you're trying to challenge needs to have at least 3 cards in their deck to duel"
          )
          .setColor('#f44336')
      );

    //Check if player is already in duel
    let status = await Promise.all([
      Duel.findOne({
        $or: [{ player1ID: msg.member.id }, { player2ID: msg.member.id }]
      }).exec(),
      Duel.findOne({
        $or: [{ player1ID: player.id }, { player2ID: player.id }]
      }).exec()
    ]);

    if (status[0])
      return msg.embed(
        new MessageEmbed()
          .setTitle("You're already in a duel")
          .setDescription(
            "You can't challenge someone while you're already in the middle of a duel"
          )
          .setColor('#f44336')
      );

    if (status[1])
      return msg.embed(
        new MessageEmbed()
          .setTitle('Already in a duel')
          .setDescription(
            "The person you're trying to challenge is already in the middle of a duel"
          )
          .setColor('#f44336')
      );

    //Prompt
    const promptRes = await prompter.reaction(msg.channel, {
      question: `${player}, Do you accept the challenge by ${
        msg.member.displayName
      }?`,
      userId: player.id
    });

    if (!promptRes)
      return msg.embed(
        new MessageEmbed()
          .setTitle(`No response from ${player.displayName}`)
          .setDescription(`There was no response from ${player.displayName}`)
          .setColor('#f44336')
      );

    if (promptRes === 'no')
      return msg.embed(
        new MessageEmbed()
          .setTitle('Challenge Denied')
          .setDescription(
            `${msg.member}, your challenge was rejected by ${
              player.displayName
            }`
          )
          .setColor('#f44336')
      );

    //Check if any player has joined a duel
    status = await Promise.all([
      Duel.findOne({
        $or: [{ player1ID: msg.member.id }, { player2ID: msg.member.id }]
      }).exec(),
      Duel.findOne({
        $or: [{ player1ID: player.id }, { player2ID: player.id }]
      }).exec()
    ]);

    if (status[0])
      return msg.embed(
        new MessageEmbed()
          .setTitle("You're already in a duel")
          .setDescription(
            "You can't challenge someone while you're already in the middle of a duel"
          )
          .setColor('#f44336')
      );

    if (status[1])
      return msg.embed(
        new MessageEmbed()
          .setTitle('Already in a duel')
          .setDescription(
            "The person you're trying to challenge is already in the middle of a duel"
          )
          .setColor('#f44336')
      );

    //Get decks of both player's
    const player1Deck = await Deck.findOne({ memberID: msg.member.id }).exec();
    const player2Deck = await Deck.findOne({ memberID: player.id }).exec();

    // Add Both players to duel
    const duelID = uniqid();

    await Promise.all([
      //Make duels document
      new Duel({
        duelID: duelID,
        amount,
        player1ID: msg.member.id,
        player2ID: player.id,
        player1Health: profile.level * 200 + 300,
        player2Health: opponentProfile.level * 200 + 300,
        currentTurn: player.id,
        currentPhase: 'Drawing',
        player1Deck: player1Deck.mainDeck,
        player2Deck: player2Deck.mainDeck,
        player1Hand: [],
        player2Hand: [],
        player1Card: {
          isEmpty: true,
          name: '',
          attack: 0,
          defense: 0,
          attributes: []
        },
        player2Card: {
          isEmpty: true,
          name: '',
          attack: 0,
          defense: 0,
          attributes: []
        }
      }).save(),
      //Add duel to redis for time management
      client.hmsetAsync(`duels:${duelID}`, {
        timeLeft: 600,
        currentTurnTimeLeft: 60
      })
    ]);

    //Get duel
    const duel = await Duel.findOne({ duelID }).exec();

    //Adding 3 random cards to each players hands
    for (let num = 1; num <= 2; num++)
      for (let i = 1; i <= 3; i++) {
        //Selecting a random card from deck
        const randomCard = _.sample(duel[`player${num}Deck`]);

        //Removing card from deck
        const index = _.findIndex(duel[`player${num}Deck`], card => {
          return card.cardName === randomCard.cardName;
        });

        duel[`player${num}Deck`].splice(index, 1);

        //Adding card to hand
        duel[`player${num}Hand`].push(randomCard);

        //Sending drawn card in DM
        msg.guild.members
          .get(duel[`player${num}ID`])
          .send(await getCharacterEmbedByName(randomCard.cardName));
      }

    await duel.save();

    msg.embed(
      new MessageEmbed()
        .setTitle(`${msg.member.displayName} ⚔️ ${player.displayName}`)
        .setDescription('THE DUEL BEGINS!')
        .addField('Bet Amount', amount > 0 ? amount : 'No bet')
        .addField(
          `${msg.member.displayName}'s Health`,
          profile.level * 200 + 300
        )
        .addField(
          `${player.displayName}'s Health`,
          opponentProfile.level * 200 + 300
        )
        .setColor('#2196f3')
        .setFooter(`${amount === 0 ? 'Friendly Duel' : 'Competetive Duel'}`)
    );

    //-> Set timers
    const duelInterval = setInterval(async () => {
      const duelExists = await client.existsAsync(`duels:${duelID}`);

      if (!duelExists) return clearInterval(duelInterval);

      client.hincrbyAsync(`duels:${duelID}`, 'timeLeft', -1);
      client.hincrbyAsync(`duels:${duelID}`, 'currentTurnTimeLeft', -1);

      if (
        (await client.hgetAsync(`duels:${duelID}`, 'currentTurnTimeLeft')) <= 0
      ) {
        //End turn
        nextTurn(msg, true);
      }

      if ((await client.hgetAsync(`duels:${duelID}`, 'timeLeft')) <= 0) {
        //End duel
        endDuel(msg, true);
      }
    }, 1000);

    //-> Start turns
    nextTurn(msg, false, true);
  }
};
