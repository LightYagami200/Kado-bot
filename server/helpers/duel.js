//Dependencies
const redis = require('redis');
const bluebird = require('bluebird');
const mongoose = require('mongoose');
const { RichEmbed } = require('discord.js');
const prompt = require('discordjs-prompter');
const _ = require('lodash');
const { getCharacterEmbedByName } = require('../helpers/cards');

//Init
const Duel = mongoose.model('Duel');
const Profile = mongoose.model('Profile');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

function dealDamage(offensiveCard, defensiveCard) {
  let atk = offensiveCard.attack,
    def = defensiveCard.defense,
    offAttrs = offensiveCard.attributes,
    defAttrs = defensiveCard.attributes,
    offenseMultiplier = 1,
    defenseMultiplier = 1;

  offAttrs.forEach(offAttr => {
    defAttrs.forEach(defAttr => {
      //Offensive Multipliers
      if (offAttr === 'water' && defAttr === 'fire') offenseMultiplier += 0.5;
      if (offAttr === 'fire' && defAttr === 'earth') offenseMultiplier += 0.2;
      if (offAttr === 'electric' && defAttr === 'water')
        offenseMultiplier += 0.5;
      if (offAttr === 'earth' && defAttr === 'electric')
        offenseMultiplier += 0.5;
      if (offAttr === 'intelligent' && defAttr === 'dumb')
        offenseMultiplier += 2;
      if (offAttr === 'celestial' && defAttr === 'undead')
        offenseMultiplier += 1;
      if (offAttr === 'brave' && defAttr === 'coward') offenseMultiplier += 1;
      if (offAttr === 'undead' && defAttr === 'mortal')
        offenseMultiplier += 0.5;

      //Defensive Multipliers
      if (offAttr === 'water' && defAttr === 'electric')
        defenseMultiplier += 0.5;
      if (offAttr === 'fire' && defAttr === 'water') defenseMultiplier += 0.5;
      if (offAttr === 'electric' && defAttr === 'earth')
        defenseMultiplier += 0.5;
      if (offAttr === 'earth' && defAttr === 'fire') defenseMultiplier += 0.2;
      if (offAttr === 'dumb' && defAttr === 'intelligent')
        defenseMultiplier += 3;
      if (offAttr === 'undead' && defAttr === 'celestial')
        defenseMultiplier += 2;
      if (offAttr === 'coward' && defAttr === 'brave') defenseMultiplier += 1;
    });
  });

  if (offensiveCard.isEmpty) {
    return { offensiveCard, defensiveCard, healthMinus: 0, status: 'empty' };
  } else if (def * defenseMultiplier > atk * offenseMultiplier) {
    return {
      offensiveCard: offensiveCard,
      defensiveCard: Object.assign(defensiveCard, {
        defense: def * defenseMultiplier - atk * offenseMultiplier
      }),
      healthMinus: 0,
      status: 'def'
    };
  } else {
    return {
      offensiveCard: offensiveCard,
      defensiveCard: {
        isEmpty: true,
        name: '',
        attack: 0,
        defense: 0,
        attributes: []
      },
      healthMinus: atk * offenseMultiplier - def * defenseMultiplier,
      status: 'damage'
    };
  }
}

async function nextTurn(msg, timeEnded = false, firstTurn = false) {
  //Get duel document
  const duel = await Duel.findOne({
    $or: [{ player1ID: msg.member.id }, { player2ID: msg.member.id }]
  }).exec();

  //Reset timer
  await client.hsetAsync(`duels:${duel.duelID}`, 'currentTurnTimeLeft', 60);

  //If time ran out
  if (timeEnded)
    msg.embed(new RichEmbed().setTitle('Time Ran Out').setColor('#f44336'));

  //If this is not the first turn
  if (!firstTurn) {
    //-> Update Turn
    duel.currentTurn =
      duel.currentTurn === duel.player1ID ? duel.player2ID : duel.player1ID;
  }

  //Send a message to notify that next turn has started
  await msg.embed(
    new RichEmbed()
      .setTitle('Turn Begins')
      .setDescription(
        `Current Turn: ${msg.guild.members.get(duel.currentTurn)}`
      )
      .setColor('#2196f3')
  );

  //Setting phase to 'Drawing'
  duel.currentPhase = 'Drawing';

  await duel.save();

  //If there are no more cards in deck
  if (
    duel[`player${duel.currentTurn === duel.player1ID ? '1' : '2'}Deck`]
      .length < 1
  ) {
    duel[`player${duel.player1ID === msg.member.id ? '2' : '1'}Health`] -= 100;
    msg.embed(
      new RichEmbed()
        .setTitle(
          "You lose 100 HP as you don't have any more cards left in your deck"
        )
        .setColor('#f44336')
    );

    if (
      duel[`player${duel.player1ID === msg.member.id ? '2' : '1'}Health`] <= 0
    ) {
      await duel.save();
      return endDuel(msg, false);
    }
  } else {
    //Prompt for Drawing a card from deck
    const drawCard = await prompt.reaction(msg.channel, {
      question: 'Do you want to draw a card?',
      userId: duel.currentTurn
    });

    if (drawCard === 'yes') {
      //Selecting a random card from deck
      const randomCard = _.sample(
        duel.player1ID === duel.currentTurn
          ? duel.player1Deck
          : duel.player2Deck
      );

      //Removing card from deck
      const index = _.findIndex(
        duel.player1ID === duel.currentTurn
          ? duel.player1Deck
          : duel.player2Deck,
        card => {
          return card.cardName === randomCard.cardName;
        }
      );

      if (duel.player1ID === duel.currentTurn)
        duel.player1Deck.splice(index, 1);
      else duel.player2Deck.splice(index, 1);

      //Adding card to hand
      if (duel.player1ID === duel.currentTurn)
        duel.player1Hand.push(randomCard);
      else duel.player2Hand.push(randomCard);

      //Sending drawn card in DM
      msg.guild.members
        .get(duel.currentTurn)
        .send(await getCharacterEmbedByName(randomCard.cardName));

      //Sending a message to notify that a card was drawn
      msg.embed(
        new RichEmbed()
          .setTitle('Card Drawn')
          .setDescription(
            `A card was drawn by ${
              msg.guild.members.get(duel.currentTurn).displayName
            }`
          )
          .setColor('#2196f3')
      );
    }
  }

  //Setting duel phase to 'Battle'
  duel.currentPhase = 'Battle';
  await duel.save();
}

async function endDuel(msg, timeEnded = false) {
  //If time ran out
  if (timeEnded)
    msg.embed(
      new RichEmbed().setTitle('Duel Time ran out').setColor('#f44336')
    );

  //Get duel document
  const duel = await Duel.findOne({
    $or: [{ player1ID: msg.member.id }, { player2ID: msg.member.id }]
  }).exec();

  //Clear timers
  await client.delAsync(`duels:${duel.duelID}`);

  //Get Profiles
  let profileWin, profileLose;

  if (duel.player1Health > duel.player2Health) {
    profileWin = await Profile.findOne({ memberID: duel.player1ID }).exec();
    profileLose = await Profile.findOne({ memberID: duel.player2ID }).exec();
  } else {
    profileWin = await Profile.findOne({ memberID: duel.player2ID }).exec();
    profileLose = await Profile.findOne({ memberID: duel.player1ID }).exec();
  }

  //If it was a competitive duel
  if (duel.amount > 0) {
    //Settle Bet
    profileWin.addCoins(duel.amount);
    profileLose.deductCoins(duel.amount);

    //Increase Wins/Losses
    profileWin.win();
    profileLose.lose();

    //Calculating earned exp
    const winExp = Math.round(
      profileLose.level ** 2 - profileWin.level ** 2 > 0
        ? profileLose.level ** 2 - profileWin.level ** 2
        : profileLose.level ** 2 / 2
    );
    const loseExp = Math.round(
      (profileLose.level ** 2 - profileWin.level ** 2 > 0
        ? profileLose.level ** 2 - profileWin.level ** 2
        : profileLose.level ** 2 / 2) / 10
    );

    //Calculating League Points
    const RawLP = Math.round(profileLose.leaguePoints / 20);
    const LP = RawLP > 0 ? RawLP : 0;

    //Making changes
    profileWin.addExp(winExp);
    profileLose.addExp(loseExp);
    profileWin.addLeaguePoints(LP);
    profileLose.deductLeaguePoints(LP);
  }

  //Deleting Duel Document
  await Duel.deleteOne({
    $or: [{ player1ID: msg.member.id }, { player2ID: msg.member.id }]
  }).exec();

  //Sending Embed
  msg.embed(
    new RichEmbed()
      .setTitle(`Duel Ended`)
      .setDescription(
        `${
          msg.guild.members.get(
            duel.player1Health > duel.player2Health
              ? duel.player1ID
              : duel.player2ID
          ).displayName
        } defeated ${
          msg.guild.members.get(
            duel.player2Health > duel.player1Health
              ? duel.player1ID
              : duel.player2ID
          ).displayName
        }`
      )
      .setColor('#2196f3')
  );
}

module.exports.dealDamage = dealDamage;
module.exports.nextTurn = nextTurn;
module.exports.endDuel = endDuel;
