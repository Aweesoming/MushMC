const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const userStats = require("../modules/api/userStats");

module.exports = {
    name: "duels",
    description: "Estatísticas de Duels Sopa do jogador.",
    options: [
        {
            type: "SUB_COMMAND",
            name: "geral",
            description: "Mostra as estatísticas completas de Duels Sopa do jogador.",
            options: [
                {
                    type: "STRING",
                    name: "jogador",
                    description: "Nome do jogador a ser verificado.",
                    required: true,
                },
            ],
        },
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {

        const subCommand = interaction.options.getSubcommand();

        if (subCommand === "geral") {
            const usernameParam = interaction.options.getString("jogador")?.toLowerCase();
            if (!usernameParam) return;

            try {
                const fetch = await import("node-fetch");
                const response = await fetch.default(`https://mush.com.br/api/player/${usernameParam}`);
                const data = await response.json();

                if (!data || !data.success || !data.response || !data.response.account) {
                    return await interaction.reply(`\`❌\` » Esse jogador não está registrado no servidor.`);
                }

                const { account, stats } = data.response;

                const duelsStats = stats.duels;

                let soupKills = duelsStats.soup_kills ?? 0;
                let soupDeaths = duelsStats.soup_deaths ?? 0;
                let soupWins = duelsStats.soup_wins ?? 0;
                let soupLosses = duelsStats.soup_losses ?? 0;
                let soupPlayed = duelsStats.soup_played ?? 0;
                let soupWinstreak = duelsStats.soup_winstreak ?? 0;

                const leaderboardResponse = await fetch.default("https://mush.com.br/api/leaderboard/soup");
                const leaderboardData = await leaderboardResponse.json();

                if (!leaderboardData || !leaderboardData.records) {
                    console.error("[Perfil]", "Erro ao obter informações do Top Rank.");
                    return await interaction.reply(`\`❌\` » Ocorreu um erro ao obter as informações do Top Rank.`);
                }

                const topRank =
                    leaderboardData.records.findIndex((record) => record.account.username.toLowerCase() === usernameParam) + 1;

                let description = `\`•\` Jogador » **${account.username}**\n`;
                if (topRank > 0 && topRank <= 100) {
                    description += `\`•\` Classificação no Top Rank » **${topRank}º lugar**\n\n`;
                } else {
                    description += `\`•\` Classificação no Top Rank » Este jogador não está classificado no Top Rank.\n\n`;
                }
                description += `\`•\` Abates » **${soupKills}**\n`;
                description += `\`•\` Mortes » **${soupDeaths}**\n\n`;
                description += `\`•\` Vitórias » **${soupWins} (${getWinPercentage(soupWins, soupLosses)}%)**\n`;
                description += `\`•\` Derrotas » **${soupLosses}**\n\n`;
                description += `\`•\` Partidas jogadas » **${soupPlayed}**\n`;
                description += `\`•\` Sequência de vitórias » **${soupWinstreak}**`;

                let skinUrl;
                if (account.unique_id) {
                    const uuid = account.unique_id.replace(/-/g, "");
                    skinUrl = `https://visage.surgeplay.com/face/${uuid}.png`;
                } else {
                    skinUrl = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7";
                }

                const embed = new MessageEmbed()
                    .setAuthor(`Estatísticas do Duels » ${account.username}`, `https://imgur.com/WPOIUqR.png`)
                    .setColor("#2f3136")
                    .setThumbnail(skinUrl)
                    .setDescription(description)
                    .setFooter({
                        text: "Desenvolvido por Awesoming",
                        iconURL: "https://cdn.discordapp.com/avatars/354304147920519169/5b01129d18e3b550c73f5c5a970dbc88.png?size=2048",
                    });

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error("[Perfil]", "Erro ao obter as estatísticas do jogador de Skywars:", error);
                await interaction.reply(`\`❌\` » Ocorreu um erro ao obter as estatísticas de Skywars do jogador.`);
            }
        }
    },
};

function getWinPercentage(wins, losses) {
    if (wins === 0 && losses === 0) {
        return 0;
    }

    return ((wins / (wins + losses)) * 100).toFixed(2);
}