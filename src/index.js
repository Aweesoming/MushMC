require("dotenv").config();

const { Client, Collection, Intents } = require("discord.js");
const eventHandler = require("./handlers/EventHandler");

const client = new Client({
    intents: [ Intents.FLAGS.GUILDS ]
});

client.commands = new Collection();
client.mush = {
    cache: {
        profile: new Collection(),
        leaderboard: new Collection()
    },

    leaderboardModes: []
}

eventHandler(client);

client.login(process.env.BOT_TOKEN);