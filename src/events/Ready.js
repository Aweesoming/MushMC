const { Client } = require("discord.js");
const commandHandler = require("../handlers/CommandHandler");
const leaderboardModes = require("../modules/scraping/leaderboardModes");

module.exports = {
    name: "ready",

    /**
     * @param {Client} client
     */
    run: async (client) => {
        console.log("[Bot]", "Bot conectado ao Discord!");

        try {
            client.mush.leaderboardModes = await leaderboardModes();
        } catch(e) {
            console.error("[Scraping]", "Falha ao carregar a lista de modos do leaderboard:\n", e);
            console.log("[Bot]", "Desligando o bot...");
            return client.destroy();
        }

        commandHandler(client);
    }
}