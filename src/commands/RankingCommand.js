const { Client, CommandInteraction, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const leaderboard = require("../modules/scraping/leaderboard");

let pageLimit = 20;

function pageMessage(minigame, minigameId, minigameName, page, pages) {
    let description = minigame.colums.join(" | ") + "\n";
    for (let i = (page - 1) * pageLimit; i < page * pageLimit; i++) {
        description += `${minigame.rows[i].join(" » ")}\n`;
    }

    let embed = new MessageEmbed()
        .setAuthor(`Ranking » ${minigameName}`, `https://imgur.com/BYQgiDa.png`)
        .setColor("#2f3136")
        .setDescription(description)
        .setFooter({
            text: "Desenvolvido por Awesoming",
            iconURL: "https://cdn.discordapp.com/avatars/354304147920519169/5b01129d18e3b550c73f5c5a970dbc88.png?size=2048",
        });

    let previousButton = new MessageButton()
        .setCustomId("previous")
        .setLabel("< Anterior")
        .setStyle("PRIMARY");
    if (page <= 1) previousButton.setDisabled(true);

    let nextButton = new MessageButton()
        .setCustomId("next")
        .setLabel("Próximo >")
        .setStyle("PRIMARY");
    if (page >= pages) nextButton.setDisabled(true);

    let pageButtons = new MessageActionRow()
        .addComponents(
            previousButton,
            new MessageButton()
                .setCustomId("pages")
                .setLabel(`${page}/${pages}`)
                .setDisabled(true)
                .setStyle("SECONDARY"),
            nextButton
        );

    return { embed, pageButtons };
}

module.exports = {
    name: "ranking",
    description: "Mostra estatísticas de Bedwars do jogador.",
    options: [
        {
            type: "SUB_COMMAND",
            name: "ver",
            description: "Veja o toprank de um Minigame.",
        },
    ],
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        let page = 1;
        let pages = 0;
        let minigame;
        let minigameId;
        let minigameName;
        let menuOptions = [];

        for (let minigame of client.mush.leaderboardModes) {
            menuOptions.push({
                label: minigame.title,
                value: minigame.id,
            });
        }

        const actionRow = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId("minigame")
                .setPlaceholder("Selecione um minigame")
                .setOptions(menuOptions)
        );

        const embed = new MessageEmbed()
            .setAuthor(`Sistema de Ranking » MushMC`, `https://imgur.com/BYQgiDa.png`)
            .setDescription("Selecione um dos minigames abaixo para visualizar os melhores jogadores e suas conquistas: Basta escolher a opção desejada no menu suspenso para conferir os rankings. Explore as habilidades dos melhores jogadores e inspire-se para alcançar o topo!\n\nEstamos aqui para ajudar caso tenha alguma dúvida ou precise de mais informações. Boa sorte e divirta-se explorando o mundo dos jogos! 🎉🏅🎉")
            .setImage("https://imgur.com/7ZpKzic.png")
            .setColor("#2f3136")
            .setFooter({
                text: "Desenvolvido por Awesoming", iconURL: "https://cdn.discordapp.com/avatars/354304147920519169/5b01129d18e3b550c73f5c5a970dbc88.png?size=2048",
            });

        await interaction.reply({
            embeds: [embed],
            components: [actionRow],
        });

        let m = await interaction.fetchReply();
        let filter = (i) => i.user.id === interaction.user.id;
        m.createMessageComponentCollector({ filter, idle: 30000 })
            .on("collect", async (i) => {
                await i.deferUpdate();

                if (i.isSelectMenu()) {
                    page = 1;

                    if (minigameId != i.values[0]) {
                        minigameId = i.values[0];
                        minigameName = menuOptions.find((v) => v.value == minigameId).label;

                        try {
                            minigame = client.mush.cache.leaderboard.get(minigameId);
                            if (!minigame || minigame.lastActivity + 10 * 60 * 1000 <= Date.now()) {
                                minigame = await leaderboard(minigameId);
                                minigame.lastActivity = Date.now();
                                client.mush.cache.leaderboard.set(minigameId, minigame);
                            }
                            minigame = JSON.parse(JSON.stringify(minigame));
                        } catch (e) {
                            console.error(e);

                            return interaction.editReply({
                                content:
                                    "Ocorreu um erro ao consultar o ranking. Talvez seja um minigame inválido. Tente novamente mais tarde.",
                                embeds: [],
                                components: [],
                            });
                        }

                        pages = Math.floor(minigame.rows.length / pageLimit);

                        minigame.colums.forEach((v, i) => {
                            minigame.colums[i] = `**${v}**`;
                        });

                        for (let i = 0; i < minigame.rows.length; i++) {
                            let player = minigame.rows[i];
                            if (!player) break;
                        
                            player[0] = player[0] == 1 ? `\`•\` 🥇` : player[0] == 2 ? `\`•\` 🥈` : player[0] == 3 ? `\`•\` 🥉` : `\`•\` **${player[0]}º**`;
                            player[1] = ` ${player[1]}`;                            
                            for (let j = 2; j < player.length; j++) {
                                player[j] = `\`${player[j]}\``;
                            }
                        }                        
                    }
                } else if (i.isButton()) {
                    if (i.customId == "previous" && page > 1) page--;
                    else if (i.customId == "next" && page < pages) page++;
                }

                let { embed, pageButtons } = pageMessage(minigame, minigameId, minigameName, page, pages);

                return i.editReply({ embeds: [embed], components: [actionRow, pageButtons] });
            })
            .on("end", async (collected, reason) => {
                if (reason == "idle") {
                    if (collected.size > 0) {
                        return interaction.editReply({
                            content: "Por favor, digite novamente o comando /ranking e deixe que o Sistema de Top Rank surpreenda você com um incrível ranking dos outros minigames disponíveis. 🌟💪",
                            components: [],
                        });
                    } else {
                        return interaction.editReply({
                            content:
                                `\`⌛\` Solicitação requisição ao toprank cancelada, você demorou para escolher um minigame.`,
                            components: [],
                            embeds: [],
                        });
                    }
                }
            });
    },
};