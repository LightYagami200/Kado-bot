//Dependencies
const { model, Schema } = require('mongoose');
const { expToNextLevel } = require('../helpers/levels');
const { getLeagueName } = require('../helpers/league');

//Schema
module.exports = client => {
  const profileSchema = new Schema({
    memberID: {
      type: String,
      unique: true
    },
    exp: Number,
    level: Number,
    badges: [String],
    equippedBadge: String,
    coins: Number,
    wins: Number,
    loses: Number,
    checkedIn: Boolean, //Did user check in today?
    league: Number, //Copper, Iron, Bronze, Silver, Gold, Dark Gold, Platinum, Diamond, Supreme, Legendary
    leaguePoints: Number //100 points = 1 league up, league points earned/deducted are based upon player's league
  });

  //Schema Methods
  profileSchema.methods.deductCoins = async function(coinsToDeduct) {
    if (this.coins - coinsToDeduct < 0)
      throw new Error('Insufficient Coins, Fix the error!');
    await this.updateOne({
      $inc: {
        coins: -coinsToDeduct
      }
    });
    return true;
  };

  profileSchema.methods.addCoins = async function(coinsToAdd) {
    await this.updateOne({
      $inc: {
        coins: coinsToAdd
      }
    });
    return true;
  };

  profileSchema.methods.win = async function() {
    await this.updateOne({
      $inc: {
        wins: 1
      }
    });
    return true;
  };

  profileSchema.methods.lose = async function() {
    await this.updateOne({
      $inc: {
        loses: 1
      }
    });
    return true;
  };

  profileSchema.methods.addExp = async function(expToAdd) {
    if (this.level === 100) return true;

    const user = client.users.get(this.memberID);
    user.send(`You earned ${expToAdd} exp!`);

    const levelUp = async exp => {
      this.level++;
      user.send(`Congrats! You have reached **Level ${this.level}** 🎉🎉🎉`);
      if (this.level % 10 === 0) {
        const deck = await this.model('Deck')
          .findOne({ memberID: this.memberID })
          .exec();
        await deck.increaseMainDeckSize();
      }
      const expLeft = exp - expToNextLevel(this.level - 1, this.exp);
      if (expLeft >= expToNextLevel(this.level, this.exp)) levelUp(expLeft);
      else this.exp = expLeft;
    };

    if (this.exp + expToAdd >= expToNextLevel(this.level, this.exp))
      levelUp(expToAdd + this.exp);
    else this.exp += expToAdd;

    await this.save();
    return true;
  };

  profileSchema.methods.checkIn = async function() {
    if (this.checkedIn) return false;

    let totalCoins = 10,
      resString =
        "You've earned $ coins, come back tommorow to get $ more coins.\n\nJoin Aldovia to get 10 more coins everyday: https://discord.gg/JGsgBsN";

    if (
      client.guilds
        .get(
          process.env.NODE_ENV === 'production'
            ? '556442896719544320'
            : '582529974754476042'
        )
        .members.get(this.memberID)
    ) {
      totalCoins += 10;
      resString =
        "You've earned $ coins, come back tommorow to get $ more coins.\n\nThanks for being a Part of Aldovia!";
    }

    resString += "\n\nBe sure to vote Kādo everyday to get 10 coins: http://bit.ly/kadobot\n\nJoin our subreddit to stay up to date with latest features and updates:\n https://www.patreon.com/bePatron?u=23514174\n\nSponsored by the [Anime Music Radio](https://www.twitch.tv/animeshon_music), ***24/7 live anime music** with requests*\n\nTake a look at `about` command to get list of new features in this update";

    const partners = await this.model('Partner')
      .find()
      .exec();

    partners.forEach(partner => {
      if (client.guilds.get(partner.guildID).members.get(this.memberID))
        totalCoins += 5;
    });

    this.checkedIn = true;

    await this.updateOne({
      $inc: {
        coins: totalCoins
      }
    });

    await this.save();

    return resString.split('$').join(totalCoins);
  };

  profileSchema.methods.addLeaguePoints = async function(lp) {
    if (this.leaguePoints === 1000) return false;

    this.leaguePoints += lp;

    const oldLeague = this.league;

    this.league = Math.min(10, Math.floor(this.leaguePoints / 100));

    await this.save();

    if (this.league > oldLeague)
      client.members
        .get(this.memberID)
        .send(
          `Congrats! You've reached **${getLeagueName(this.league)}** 🎉🎉🎉`
        );

    return true;
  };

  profileSchema.methods.deductLeaguePoints = async function(lp) {
    if (this.leaguePoints === 0) return false;

    this.leaguePoints -= lp;

    if (this.leaguePoints < 0) this.leaguePoints = 0;

    const oldLeague = this.league;

    this.league = Math.floor(this.leaguePoints / 100);

    await this.save();

    if (this.league < oldLeague)
      client.members
        .get(this.memberID)
        .send(`Ooops! You've dropped to **${getLeagueName(this.league)}** :(`);

    return true;
  };

  //Creating Model
  model('Profile', profileSchema);
};
