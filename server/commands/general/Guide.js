//Dependencies
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const paginationEmbed = require('discord.js-pagination');

//Main
module.exports = class LeaderboardsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'guide',
      guildOnly: false,
      aliases: ['guide', 'tutorial', 'howtoplay', 'helpme'],
      group: 'general',
      memberName: 'guide',
      description: 'View Guide',
      examples: ['guide']
    });
  }

  async run(msg) {
    const page1 = new MessageEmbed({
      title: 'Guide Contents',
      description:
        '1) Getting Started\n2) Command Syntax\n3) Profile\n4) Collecting Cards\n5) Shop\n6) Cards\n7) Deck & Reserve\n8) Dueling\n9) Trading\n10) Attributes',
      color: 0x2196f3
    });
    const page2 = new MessageEmbed({
      title: 'Getting Started',
      description:
        'Kado bot is a card collecting/dueling bot featuring cards, over the course of next pages, you will learn how to use this bot to collect cards and destroy your opponents in duels',
      color: 0x2196f3
    });
    const page3 = new MessageEmbed({
      title: 'Command Syntax',
      description:
        'You should know that anything in this guide written like this: `loremipsum` is a command and can be used with prefix. An example would be `about` command, just type that with prefix (default prefix is `$`) to view info about the bot and changelog',
      color: 0x2196f3
    });
    const page4 = new MessageEmbed({
      title: 'Profile',
      description:
        "To get started, type `register`, that'll register your profile\n\nNow type `profile` to view your newly created profile. Once you're done admiring your profile, type `stats` to view your stats such as how many people have you crushed and how many times have you been crushed yourself\n\nYou might be intrigued about that league thing, but don't worry, that'll be covered in this guide later on",
      color: 0x2196f3
    });
    const page5 = new MessageEmbed({
      title: 'Collecting Cards',
      description:
        "Now let's get to the stuff you're here for,\nCards the blood and soul of Kado bot, cards can be collected in several different ways (We'll explore them in great detail later on)\n> Purchasing Card Packs\n> Trading\n> Tournaments\n\n Now let's see how you can purchase card packs",
      color: 0x2196f3
    });
    const page6 = new MessageEmbed({
      title: 'Shop',
      description:
        "You might've seen in your profile that you have some coins, now is the part where you use those coins\n\nType `shop` to open up the shop and view card packs available for purchase\n\nYou may notice that only a few card packs are available for purchase currently, well, that's because our game masters are pretty lazy\n\nNow let's purchase a basic card pack for now, I know it's sad to purchase a common cheapest card pack but hey all adventurers start small, now type `purchase basic` to purchase the basic characters pack\n\nCongrats, now you have 3 Cards! Let's learn more about cards on next page",
      color: 0x2196f3
    });
    const page7 = new MessageEmbed({
      title: 'Cards',
      description:
        "There are 5 different tiers of cards:\n> Common\n> Uncommon\n> Rare\n> Epic\n> Legendary\n\nThe higher the tier of a card is, the more strong that card will be. Cards have 3 notable things:\n> ATK\n> DEF\n> Attributes\n\n The greater the ATK and DEF are, the better it is. Attributes are a bit more complicated and thus they'll be discussed later on in the guide",
      color: 0x2196f3
    });
    const page8 = new MessageEmbed({
      title: 'Deck & Reserve',
      description:
        "When you purchase cards, they go in your reserve. The 3 cards you just purchased are in your reserve, and to make them usable in duel, you have to move them to main deck. But before you move any cards, type `reserve` and `main` to take a look at your reserve cards and main cards\n\nYou might've seen your main deck is empty, that's because you haven't moved any card to your main deck, so let's do that now\n\nType `move` to open a menu that'll allow you to move cards, Just tinker around with the menu until you understand how it works\n\nPlease note that you should use `move` command in DMs if you don't wish other people to see your cards",
      color: 0x2196f3
    });
    const page9 = new MessageEmbed({
      title: 'Dueling',
      description:
        "Now let's move on to dueling, To duel with anyone, you must first have at least 3 cards in your main deck so if you already haven't moved your 3 cards to your main deck, be sure to do so\n\nNow that your deck is ready and you're prepared to crush (or be crushed by) some opponents!\n\nType `challenge @personToChallenge bet` (eg: `challenge @Creeper 10`) to challenge someone, you can input 0 bet for a friendly duel.\n\nFew important things to note about duels is that when you're in a friendly duel, you won't get any exp and you won't win/lose LP (more on that later) and your stats won't be affected but while you're in a competitive duel (bet > 0), your stats WILL be affected",
      color: 0x2196f3
    });
    const page10 = new MessageEmbed({
      title: 'Dueling (Part 2)',
      description:
        'When your opponent accepts your challenge, your duel will begin, and you can use these commands during a duel:\n> Play\n> Hand\n> DuelState\n> EndTurn\n\n Play command is used to play a card, Hand command is used to view all the cards in your hand (more on this later), DuelState command is used to view current state of the duel and last but not least, EndTurn is used to end your turn',
      color: 0x2196f3
    });
    const page11 = new MessageEmbed({
      title: 'Dueling (Part 3)',
      description:
        "In a duel, you can only play cards that are in your Hand. When duel begins, 3 cards from your main deck will be randomly selected and moved to your hand so you can use them in duel. On each of your turn, you'll get the choice to draw a card from your deck. If you have 0 cards remaining in your deck, you will lose 100 HP on each turn, so be sure not to draw all the cards that fast\n\nTry a bunch of friendly duels to consume all this knowledge, once you're confident in your skills, then you can start destroying your opponents in competitive duels",
      color: 0x2196f3
    });
    const page12 = new MessageEmbed({
      title: 'Trading',
      description:
        "Now let's move away from all that duel stuff onwards to some peaceful trading\n\nTo trade with someone, you have to use `trade` command\n\nSyntax of this command might seem difficult to use but fear not, I'm here to explain it. So the syntax is: `trade @tradeWith cardTypeToGive cardNameToGive cardTypeToGet cardNameToGet`\n\nSo, @tradeWith refers to the person you wanna trade the card with, cardTypeToGIve and cardTypeToGet refers to which type of cards you wanna give/get, while cardNameToGive and cardNameToGet refer to the name of card you wanna give and take\n\nLet's take a look at few examples:\n\n`trade @Steve character 'Hestia' character 'Aqua'` in this example, you're giving steve your Hestia card to get his Aqua card",
      color: 0x2196f3
    });
    const page13 = new MessageEmbed({
      title: 'Attributes',
      description:
        "Attributes determine your characters attack/defense against other cards, here's a list showing which attributes are powerful against which attributes:\n\n\n> Fire > Air > Earth > Electric > Water > Fire\n> Mortal > GodSlayer > Celestial > Undead > Mortal\n> Intelligent > Dumb\n> Brave > Coward\n\nFinding out how much effect attributes have is up to you, good luck with that",
      color: 0x2196f3
    });
    const page14 = new MessageEmbed({
      title: 'Leagues',
      description:
        'These are the leagues in Kado Bot:\n> Unranked\n> Copper\n> Iron\n> Bronze\n> Silver\n> Gold\n> Dark Gold\n> Platinum\n> Diamond\n> Supreme\n> Legend\n\n To climb throught the leages, you have to earn LP. You get LP each time you win a competitive duel. To view your LP, use `stats` and to look at Top 10 people on the leaderboards, use `leaderboards`',
      color: 0x2196f3
    });
    const page15 = new MessageEmbed({
      title: 'Getting Help',
      description:
        "Whew, writing that all took me a long time. I don't think I can keep on writing, So I'll list some helpful resources here\n\nType `help` command to view list of all the commands\n\nType `help command` to get help about a specific command, example: `help move`\n\nType `about` to view info about the bot and changelogs\n\n oh and type `checkIn` to get your daily coins\n\nI know you have a lot more questions and suggestions, so feel free to shoot us a mail at: `support@kadobot.xyz`, we'll be more than happy to answer your questions and listen to your amazing suggestions\n\nFun fact: trading, interactive move menu and this improved guide were all added thanks to suggestions by some of the users\n\nGoodluck on your journey!",
      color: 0x2196f3
    });

    paginationEmbed(
      msg,
      [
        page1,
        page2,
        page3,
        page4,
        page5,
        page6,
        page7,
        page8,
        page9,
        page10,
        page11,
        page12,
        page13,
        page14,
        page15
      ],
      ['⏪', '⏩'],
      120000
    );
  }
};
