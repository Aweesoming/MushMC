const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const userStats = require("../modules/api/userStats");

module.exports = {
    name: "bedwars",
    description: "Estatísticas de Bedwars do jogador.",
    options: [
        {
            type: "SUB_COMMAND",
            name: "geral",
            description: "Mostra as estatísticas completas de Bedwars do jogador.",
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

                const bedwarsStats = stats.bedwars;

                let level = bedwarsStats.level ?? 0;
                let xp = bedwarsStats.xp ?? 0;

                let bedsBroken = bedwarsStats.beds_broken ?? 0;
                let bedsLost = bedwarsStats.beds_lost ?? 0;

                let wins = bedwarsStats.wins ?? 0;
                let losses = bedwarsStats.losses ?? 0;
                let gamesPlayed = bedwarsStats.games_played ?? 0;

                let winstreak = bedwarsStats.winstreak ?? 0;
                let kdr = (bedwarsStats.kills / bedwarsStats.deaths).toFixed(2) ?? 0;
                let wlr = (wins / losses).toFixed(2) ?? 0;
                let fkdr = (bedwarsStats.final_kills / bedwarsStats.final_deaths).toFixed(2) ?? 0;

                const xpToNextLevel = await getXpInfo(xp);
                const xpProgress = `${xp} ➜ [${xpToNextLevel.xpRemaing}/${xpToNextLevel.xpProx}]`;

                const leaderboardResponse = await fetch.default("https://mush.com.br/api/leaderboard/bedwars");
                const leaderboardData = await leaderboardResponse.json();

                if (!leaderboardData || !leaderboardData.records) {
                    console.error("[Perfil]", "Erro ao obter informações do Top Rank.");
                    return await interaction.reply(`\`❌\` » Ocorreu um erro ao obter as informações do Top Rank.`);
                }

                const topRank =
                    leaderboardData.records.findIndex((record) => record.account.username.toLowerCase() === usernameParam) + 1;

                let description = `\`•\` Jogador » **${account.username}**\n`;
                description += `\`•\` Nível » **${level}**\n`;
                description += `\`•\` XP » **${xpProgress}**\n`;

                if (topRank > 0 && topRank <= 100) {
                    description += `\`•\` Classificação no Top Rank » **${topRank}º lugar**\n\n`;
                } else {
                    description += `\`•\` Classificação no Top Rank » Este jogador não está classificado no Top Rank.\n\n`;
                }

                description += `\`•\` Camas destruídas » **${bedsBroken}**\n`;
                description += `\`•\` Camas perdidas » **${bedsLost}**\n\n`;
                description += `\`•\` Vitórias » **${wins} (${getWinPercentage(wins, losses)}%)**\n`;
                description += `\`•\` Derrotas » **${losses}**\n`;
                description += `\`•\` Partidas jogadas » **${gamesPlayed}**\n`;
                description += `\`•\` Sequência de vitórias » **${winstreak}**\n\n`;
                description += `\`•\` KDR » **${kdr}**\n`;
                description += `\`•\` WLR » **${wlr}**\n`;
                description += `\`•\` FKDR » **${fkdr}**`;

                let skinUrl;
                if (account.unique_id) {
                    const uuid = account.unique_id.replace(/-/g, "");
                    skinUrl = `https://visage.surgeplay.com/face/${uuid}.png`;
                } else {
                    skinUrl = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7";
                }

                const embed = new MessageEmbed()
                    .setAuthor(`Estatística do Bedwars » ${account.username}`, `https://imgur.com/THRstyt.png`)
                    .setColor("#2f3136")
                    .setDescription(description)
                    .setThumbnail(skinUrl)
                    .setFooter({
                        text: "Desenvolvido por Awesoming",
                        iconURL:
                            "https://cdn.discordapp.com/avatars/354304147920519169/5b01129d18e3b550c73f5c5a970dbc88.png?size=2048",
                    });

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error("[Perfil]", "Erro ao obter as estatísticas do jogador de Bedwars:", error);
                await interaction.reply(`\`❌\` » Ocorreu um erro ao obter as estatísticas de Bedwars do jogador.`);
            }
        }
    },
};

async function getXpInfo(xp) {
    const fetch = await import("node-fetch");
    const response = await fetch.default("https://mush.com.br/api/games/bedwars/xptable");
    const data = await response.json();
    const infoData = {levels: Object.keys(data), xps: Object.values(data)};
    const levelActual = infoData.levels.find(x => data[x] >= xp);
    return {level: Number(levelActual), xp: data[levelActual], proxLevel: Number(levelActual) + 1, xpProx: data[`${Number(levelActual) + 1}`], xpRemaing: data[`${Number(levelActual) + 1}`] - xp};
}

function getWinPercentage(wins, losses) {
    if (wins === 0 && losses === 0) {
        return 0;
    }

    return ((wins / (wins + losses)) * 100).toFixed(2);
}