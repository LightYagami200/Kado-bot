//Dependencies
const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

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
      examples: ['guide'],
      args: [
        {
          key: 'page',
          prompt: 'Page of guide? (1 - 5)',
          type: 'integer',
          min: 0,
          max: 5,
          default: 0
        }
      ]
    });
  }

  async run(msg, { page }) {
    const pages = [
      new RichEmbed({
        title: 'Guide Contents',
        description:
          'Type `$guide page` where page can be one of the following numbers to view respective topic:\n1) Getting Started\n2) Shop & Cards\n3) Deck & Reserve\n4) Dueling\n5) Misc',
        color: 0x2196f3
      }),
      new RichEmbed({
        title: 'Getting Started',
        description:
          "Before getting started, please note that anything written in `this format` is a command and can be used with prefix (default prefix is $). To get started you need to register your profile, for that, use `register`, once your profile is registered you can use `profile` to view your profile or `profile @someone` to view someone else's profile. To View your stats, use `stats`. To get daily coins, use `$checkin`. To get the list of all commands use `help` and for help regarding specific command, use `help <command>` (eg: `help profile`)",
        color: 0x2196f3
      }),
      new RichEmbed({
        title: 'Shop & Cards',
        description:
          'Cards are the core element of Kado bot, to collect cards you have to open card packs. There are 5 tiers of cards:\n-> Common Cards\n-> Uncommon Cards\n-> Rare Cards\n-> Epic Cards\n-> Legendary Cards\n\nYou can purchase different card packs from shop which contain different tiers of cards. To view available card packs for purchase, use `shop`. To purchase a card pack, use `purchase <pack name>`. To purchase your first card pack, type `purchase "Basic Characters Pack"`. Now that you have few card packs, you\'ll learn how to manage your deck in next section.',
        color: 0x2196f3
      }),
      new RichEmbed({
        title: 'Deck & Reserve',
        description:
          "When you purchase cards, they go in your 'reserve'. And when you're dueling with someone, cards from your 'main' deck are used. To view your reserve, use `reserve` and for main deck, use `deck`. Now let's move the cards you purchased to your main deck so you're ready for duels. For that, use `move character \"Character Name\" reserve main`, where Character Name is the name of character you wish to move. As you're moving character from 'reserve' to 'main', thus we used 'reserve main', for moving cards from main deck to reserve, you'd do `move character \"Character Name\" main reserver`. After moving the 3 cards that you purchased to your main deck, you're now ready for DUELS!",
        color: 0x2196f3
      }),
      new RichEmbed({
        title: 'Dueling',
        description:
          "Now that your main deck is ready and you're up for duels, use `challenge` command to duel someone. There are 2 types of duels, namely 'friendly' and 'competitive'. Friendly duels don't affect your league points or your win/lose ratio while competitive duels affect both. To challenge someone, use `challenge @person amount` where amount is the amount of coins you wanna bet, If amount is 0, the duel is a friendly duel. Once your opponent accepts your challenge, the duel will begin and the person who was challenged will go first. On your turn you can draw 1 card and play 1 card. To play a card, use `play character \"Character name\"`. You can only play cards that are in your hand. Once you run out of cards in your deck, you will start to lose 100 HP each turn. To end your turn, use `endturn`. To view state of the duel at any time, use `duelState`. Please not that the duel timer will run out after 10 minutes and each turn has a timer of 60 seconds. Another important thing to note are the attributes, There are certain attributes that are more powerful against other attributes, such as celestial having 2x more ATK against undead. Now it's up to you to discover further attributes and their advantage against othter attributes.",
        color: 0x2196f3
      }),
      new RichEmbed({
        title: 'Misc',
        description:
          "You start off with Level 1, to level up you must earn EXP, you can earn exp by opening card packs and winning competitive duels. And you start off with 50 LP and League 0. To Get more LP, you must win competitive duels. When you duel with someone, winner gets 5% of loser's LP. So if you challenge someone with 0 LP, you should know that you'll get 0 LP even if you win. Following are the leagues:\n0) Unranked (0 - 99 LP)\n1) Copper (100 - 199 LP)\n2) Iron (200 - 299 LP)\n3) Bronze (300 - 399 LP)\n4) Silver (400 - 499 LP)\n5) Gold (500 - 599 LP)\n6) Dark Gold (600 - 699 LP)\n7) Platinum (700 - 799 LP)\n8) Diamond (800 - 899 LP)\n9) Supreme (900 - 999 LP)\n10) Legend (1,000+ LP)\n\nIf you have any further questions or suggestions, feel free to shoot us an email at support@kadobot.xyz\n\nGood Luck Dueler!",
        color: 0x2196f3
      })
    ];

    msg.embed(pages[page]);
  }
};
