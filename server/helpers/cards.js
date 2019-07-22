//Dependencies
const { model } = require('mongoose');
const { RichEmbed } = require('discord.js');
const _ = require('lodash');

//Init
const Character = model('Character');
const CardPack = model('CardPack');

//Functions
async function getCharacterEmbedByName(name) {
  const character = await Character.findOne({ name }).exec();

  if (!character) return;

  let attStr = '';

  character.attributes.forEach(attribute => {
    attStr += `• ${_.upperFirst(attribute)}\n`;
  });

  const embed = new RichEmbed()
    .setTitle(character.name)
    .setDescription(character.description)
    .addField('Attributes', attStr)
    .addField('Stats', `ATK: ${character.attack} \\ DEF: ${character.defense}`)
    .setImage(character.pictureUrl)
    .setColor(getCardColor(character.tier))
    .setFooter(getCardTierName(character.tier));

  if (character.tier > 2)
    embed.addField(
      'Rarity',
      `Only ${character.stock} card(s) of this type exist`
    );

  return embed;
}

async function getCardPackEmbedByName(name) {
  const cardPack = await CardPack.findOne({ name }).exec();

  if (!cardPack) return;

  var priceStr = '';
  if (cardPack.discount > 0)
    priceStr =
      String(cardPack.price - cardPack.price * cardPack.discount) +
      ` Coins ~~${cardPack.price} Coins~~ (${Math.round(
        cardPack.discount * 100
      )}% Off)`;
  else priceStr = String(cardPack.price) + ' Coins';

  const embed = new RichEmbed()
    .setTitle(cardPack.name)
    .setDescription(cardPack.description)
    .addField('Cards Type', _.capitalize(cardPack.type))
    .addField('Cards In Pack', cardPack.cards)
    .addField('Price', priceStr)
    .setColor(getCardColor(cardPack.tier))
    .setFooter(getCardTierName(cardPack.tier));

  if (cardPack.guaranteedTier > 1)
    embed.addField(
      'Guaranteed Cards',
      `1 Guaranteed **${getCardTierName(cardPack.guaranteedTier)}** Card inside`
    );

  if (cardPack.stock > -1) embed.addField('Left In Stock', cardPack.stock);

  return embed;
}

function getCardColor(tier) {
  switch (tier) {
    case 1:
      return '#9e9e9e';
    case 2:
      return '#4caf50';
    case 3:
      return '#f44336';
    case 4:
      return '#2196f3';
    case 5:
      return '#ffc107';
  }
}

function getCardTierName(tier) {
  switch (tier) {
    case 1:
      return 'Common';
    case 2:
      return 'Uncommon';
    case 3:
      return 'Rare';
    case 4:
      return 'Epic';
    case 5:
      return 'Legendary';
  }
}

//Exports
module.exports.getCardColor = getCardColor;
module.exports.getCardTierName = getCardTierName;
module.exports.getCharacterEmbedByName = getCharacterEmbedByName;
module.exports.getCardPackEmbedByName = getCardPackEmbedByName;
