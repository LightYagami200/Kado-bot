# Kado Bot
## Running on your own server
### Prerequisites
- Docker
- Docker Compose
- Discord Bot Token (https://discordapp.com/developers/applications/)
- Mongo Database (https://mongodb.com/cloud/atlas)
### Running
1. Clone this repo
```
git clone https://github.com/LightYagami200/Kado-bot.git
```
2. Cd into the cloned repo folder
```
cd Kado-bot
```
3. Create a new file `.env` and add following:
```
MONGO_CONNECTION_STRING=<INSERT MONGO CONNECTION STRING HERE>
DISCORD_BOT_TOKEN=<INSERT DISCORD BOT TOKEN HERE>
```
4. Now run:
```
docker-compose start
```
