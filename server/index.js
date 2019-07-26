//==========================
//DEPENDENCIES
//==========================
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const redis = require('redis').createClient();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const MongoDBProvider = require('commando-provider-mongo');
const { CommandoClient } = require('discord.js-commando');
const redisStore = require('connect-redis')(session);
const path = require('path');
const keys = require('./config/keys');
const DBL = require('dblapi.js');
//==========================

//==========================
//CONSTANTS
//==========================
const client = new CommandoClient({
    commandPrefix: '$',
    owner: [
      '338334949331697664' //Light Yagami
    ],
    invite: 'https://discord.gg/JGsgBsN',
    disableEveryone: true
  }),
  app = express(),
  PORT = 5000;
//==========================

//==========================
//EXPRESS
//==========================
app.use(
  session({
    secret: '(-exyZ`]3W}>L3E[',
    store: new redisStore({
      host: keys.redisHost,
      port: keys.redisPort,
      client: redis,
      ttl: 260
    }),
    saveUninitialized: true,
    resave: false
  })
);
app.use(bodyParser.json());
//==========================

//==========================
//MONGOOSE
//==========================
mongoose
  .connect(keys.mongoConnectionString, {
    useNewUrlParser: true
  })
  .then(() => {
    console.log('Database Status: Online');
    //->Creating models
    require('./models/Profile')(client);
    require('./models/Character');
    require('./models/CardPack');
    require('./models/Deck');
    require('./models/Duel');
    require('./models/Coupon');
    require('./models/Partner');
    require('./models/BlacklistedGuild');
    require('./models/BlacklistedUser');

    //==========================
    //CACHING
    //==========================
    mongoose
      .model('BlacklistedGuild')
      .find({})
      .exec()
      .then(guilds =>
        guilds.forEach(guild =>
          require('./inhibitors/blacklistedGuilds').add(guild.guildID)
        )
      );
    mongoose
      .model('BlacklistedUser')
      .find({})
      .exec()
      .then(users =>
        users.forEach(user =>
          require('./inhibitors/blacklistedUsers').add(user.userID)
        )
      );
    //==========================

    //==========================
    //DISCORD
    //==========================
    //->Settings provider
    client
      .setProvider(
        MongoClient.connect(keys.mongoConnectionString, {
          useNewUrlParser: true
        }).then(client => new MongoDBProvider(client, 'abot'))
      )
      .catch(console.error);
    //->Registering commands
    client.registry
      .registerDefaultTypes()
      .registerGroups([
        ['general', 'General Commands'],
        ['profile', 'Profile Commands'],
        ['shop', 'Shop Commands'],
        ['inventory', 'Inventory Commands'],
        ['duel', 'Dueling Commands'],
        ['gm', 'Game Master Commands (Can only be executed by GMs)'],
        ['stats', 'Status Commands (For Bot Owners)']
      ])
      .registerDefaultGroups()
      .registerDefaultCommands()
      .registerCommandsIn(path.join(__dirname, 'commands'));
    //->Adding Inhibitors
    client.dispatcher.addInhibitor(msg =>
      require('./inhibitors/isGuildBlacklisted')(msg.guild.id)
    );
    client.dispatcher.addInhibitor(msg =>
      require('./inhibitors/isUserBlacklisted')(msg.author.id)
    );
    //-> Connecting to Discordbots.org
    new DBL(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4MjI3MTM2NjYxOTcyNTg1NSIsImJvdCI6dHJ1ZSwiaWF0IjoxNTY0MTE4ODExfQ.unO685_FvFzPdmLfzf3vOWuU-HmQf26X9TNU99adb2w',
      client
    );
    //->When Ready
    client.on('ready', () =>
      client.user.setActivity('with Cards | $help', { type: 'PLAYING' })
    );
    //==========================
  });
//==========================

//==========================
//ROUTES
//==========================
require('./routes/webhooks')(app, client);
//==========================

//==========================
//CRON JOBS
//==========================
require('./cron/checkInCron');
//==========================

//==========================
//Listening
//==========================
client.login(keys.discordBotToken).catch(err => console.log(err));
app.listen(PORT, () => console.log('Website Status: Online'));
//==========================

//==========================
//TODO
//==========================
//-> Ability to move cards to and fro cards deck (Main deck size will be dependent on level)
//==========================

//==========================
//BUGS
//==========================
//-> Exp issue - Exp is being added to user's profile even after being used to level up
//==========================
