//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const _ = require('lodash');

//Init
const Deck = mongoose.model('Deck');
const Duel = mongoose.model('Duel');

//Main
module.exports = class MoveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'move',
      aliases: ['m'],
      group: 'inventory',
      memberName: 'move',
      description: 'Move cards among your deck/reserve',
      details:
        'Move a card to and fro main deck and reserve. WARNING: Use this command in DM to avoid anyone from seeing your decks',
      examples: ['move'],
      throttling: {
        usages: 1,
        duration: 120
      }
    });
    this.reserveArrLength = 0;
    this.deckArrLength = 0;
    this.reservePos = 0;
    this.deckPos = 0;
  }

  async run(msg) {
    this.reserveArrLength = 0;
    this.deckArrLength = 0;
    this.reservePos = 0;
    this.deckPos = 0;
    const deck = await Deck.findOne({ memberID: msg.author.id }).exec();

    if (!deck)
      return msg.embed(
        new MessageEmbed()
          .setTitle("Profile doesn't exist")
          .setDescription(
            "Profile doesn't exist, use `register` command to register profile"
          )
          .setColor('#f44336')
      );

    const duel = await Duel.findOne({
      $or: [{ player1ID: msg.author.id }, { player2ID: msg.author.id }]
    }).exec();

    if (duel)
      return msg.embed(
        new MessageEmbed()
          .setTitle('In duel!')
          .setDescription(
            "You can't use this commmand while in the middle of a duel"
          )
          .setColor('#f44336')
      );

    this.renderMsg(msg, false).then(msgM => this.setReactions(msgM, msg));
  }

  async renderMsg(msg, editMsg, error = false) {
    return new Promise(resolve => {
      Deck.findOne({ memberID: msg.author.id }).then(deck => {
        let reserveStr = '';

        let reserveArr = [];

        deck.reserveCards.forEach(card => {
          if (_.includes(reserveArr.map(c => c[0]), card.cardName))
            reserveArr[
              _.findIndex(reserveArr, c => c[0] === card.cardName)
            ][1]++;
          else reserveArr.push([card.cardName, 1]);
        });

        reserveArr.forEach((card, i) => {
          reserveStr += `${i === this.reservePos ? '**' : ''}• ${card[0]} x${
            card[1]
          }${i === this.reservePos ? '**' : ''}\n`;
        });

        let deckStr = '';

        let deckArr = [];

        deck.mainDeck.forEach(card => {
          if (_.includes(deckArr.map(c => c[0]), card.cardName))
            deckArr[_.findIndex(deckArr, c => c[0] === card.cardName)][1]++;
          else deckArr.push([card.cardName, 1]);
        });

        deckArr.forEach((card, i) => {
          deckStr += `${i === this.deckPos ? '**' : ''}• ${card[0]} x${
            card[1]
          }${i === this.deckPos ? '**' : ''}\n`;
        });

        this.reserveArrLength = reserveArr.length;
        this.deckArrLength = deckArr.length;

        const embed = new MessageEmbed()
          .setTitle('Moving Cards')
          .setDescription(error || '')
          .addField('⮞ Reserve Cards', reserveStr, true)
          .addField('⮞ Main Deck', deckStr, true)
          .setFooter('This menu expires in 60s')
          .setColor('#2196f3');

        if (editMsg) editMsg.edit(embed);
        else msg.embed(embed).then(msgM => resolve(msgM));
      });
    });
  }

  async setReactions(msg, authorMsg) {
    msg.react('🔺');
    msg.react('🔻');
    msg.react('⬅');
    msg.react('➡');
    msg.react('🔼');
    msg.react('🔽');

    //Await reactions
    const filter = (reaction, user) =>
      _.includes(['🔺', '🔻', '⬅', '➡', '🔼', '🔽'], reaction.emoji.name) &&
      user.id === authorMsg.author.id;

    const reactions = msg.createReactionCollector(filter, { time: 60000 });
    reactions.on('collect', async r => {
      const emojiName = r._emoji.name;

      //Moving Pointer
      if (emojiName === '🔺')
        this.reservePos = Math.max(0, this.reservePos - 1);
      if (emojiName === '🔻')
        this.reservePos = Math.min(
          this.reserveArrLength - 1,
          this.reservePos + 1
        );
      if (emojiName === '🔼') this.deckPos = Math.max(0, this.deckPos - 1);
      if (emojiName === '🔽')
        this.deckPos = Math.min(this.deckArrLength - 1, this.deckPos + 1);

      msg.reactions
        .find(r => r.emoji.name === emojiName)
        .users.remove(authorMsg.author.id);

      if (emojiName === '➡') this.moveCard(msg, authorMsg, 'reserve');
      if (emojiName === '⬅') this.moveCard(msg, authorMsg, 'deck');

      //Re-rendering the message
      await this.renderMsg(authorMsg, msg);
    });
    reactions.on('end', () => {
      msg.edit(
        new MessageEmbed({
          title: 'Expired',
          color: '#2196f3'
        })
      );
    });
  }

  async moveCard(msg, authorMsg, cardToMove) {
    const deck = await Deck.findOne({ memberID: authorMsg.author.id }).exec();

    let reserveArr = [];

    deck.reserveCards.forEach(card => {
      if (_.includes(reserveArr.map(c => c[0]), card.cardName))
        reserveArr[_.findIndex(reserveArr, c => c[0] === card.cardName)][1]++;
      else reserveArr.push([card.cardName, 1]);
    });

    let deckArr = [];

    deck.mainDeck.forEach(card => {
      if (_.includes(deckArr.map(c => c[0]), card.cardName))
        deckArr[_.findIndex(deckArr, c => c[0] === card.cardName)][1]++;
      else deckArr.push([card.cardName, 1]);
    });

    if (cardToMove === 'reserve') {
      const cardName = reserveArr[this.reservePos][0];
      const res = await deck.moveCard('character', cardName, 'reserve', 'main');

      if (!res)
        this.renderMsg(authorMsg, msg, 'Your main deck has reached max cards');

      if (res === 3)
        this.renderMsg(
          authorMsg,
          msg,
          'The card you are trying to move does not exist'
        );

      this.renderMsg(authorMsg, msg, 'Card successfully moved');
    } else if (cardToMove === 'deck') {
      const cardName = deckArr[this.deckPos][0];
      const res = await deck.moveCard('character', cardName, 'main', 'reserve');

      if (res === 3)
        this.renderMsg(
          authorMsg,
          msg,
          'The card you are trying to move does not exist'
        );

      this.renderMsg(authorMsg, msg, 'Card successfully moved');
    }
  }
};
