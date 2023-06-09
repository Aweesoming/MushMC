const { Client, CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
  name: "murder",
  description: "Mostra as estatísticas gerais de Murder Mystery do jogador.",
  options: [
    {
      type: "SUB_COMMAND",
      name: "geral",
      description: "Mostra as estatísticas gerais de Murder Mystery do jogador.",
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

        const murderStats = stats.murder || {};

        let coinsPickedUp = murderStats.coins_picked_up ?? 0;
        let kills = murderStats.kills ?? 0;
        let deaths = murderStats.deaths ?? 0;
        let wins = murderStats.wins ?? 0;
        let losses = murderStats.losses ?? 0;
        let played = murderStats.played ?? 0;
        let winStreak = murderStats.winstreak ?? 0;
        let winLossRatio = losses !== 0 ? (wins / losses).toFixed(2) : wins.toFixed(2);

        let description = `\`•\` Jogador » **${account.username}**\n`;
        description += `\`•\` Esmeraldas recolhidas: **${coinsPickedUp}**\n\n`;
        description += `\`•\` Abates totais: **${kills}**\n`;
        description += `\`•\` Mortes totais: **${deaths}**\n`;
        description += `\`•\` Abates como Assassino: **${kills}**\n\n`;
        description += `\`•\` Vitórias totais: **${wins}**\n`;
        description += `\`•\` Derrotas totais: **${losses}**\n`;
        description += `\`•\` Partidas jogadas totais: **${played}**\n\n`;
        description += `\`•\` Winstreak total: **${winStreak}**\n`;
        description += `\`•\` WLR total: **${winLossRatio}**`;

        let innocentStats = `\`•\` Jogador » **${account.username}**\n`;
        innocentStats += `\`•\` Esmeraldas recolhidas: **${coinsPickedUp}**\n\n`;
        innocentStats += `\`•\` Abates como Inocente: **${kills}**\n`;
        innocentStats += `\`•\` Mortes como Inocente: **${deaths}**\n`;
        innocentStats += `\`•\` Abates no Assassino: **${kills}**\n\n`;
        innocentStats += `\`•\` Vitórias como Inocente: **${wins}**\n`;
        innocentStats += `\`•\` Derrotas como Inocente: **${losses}**\n`;
        innocentStats += `\`•\` Partidas jogadas como Inocente: **${played}**\n\n`;
        innocentStats += `\`•\` Winstreak como Inocente: **${winStreak}**\n`;
        innocentStats += `\`•\` WLR como Inocente: **${winLossRatio}**`;

        let detectiveStats = `\`•\` Jogador » **${account.username}**\n`;
        detectiveStats += `\`•\` Esmeraldas recolhidas: **${coinsPickedUp}**\n\n`;
        detectiveStats += `\`•\` Abates como Detetive: **${kills}**\n`;
        detectiveStats += `\`•\` Mortes como Detetive: **${deaths}**\n`;
        detectiveStats += `\`•\` Abates no Assassino: **${kills}**\n\n`;
        detectiveStats += `\`•\` Vitórias como Detetive: **${wins}**\n`;
        detectiveStats += `\`•\` Derrotas como Detetive: **${losses}**\n`;
        detectiveStats += `\`•\` Partidas jogadas como Detetive: **${played}**\n\n`;
        detectiveStats += `\`•\` Winstreak como Detetive: **${winStreak}**\n`;
        detectiveStats += `\`•\` WLR como Detetive: **${winLossRatio}**`;

        let murdererStats = `\`•\` Jogador » **${account.username}**\n`;
        murdererStats += `\`•\` Esmeraldas recolhidas: **${coinsPickedUp}**\n\n`;
        murdererStats += `\`•\` Abates como Assassino: **${kills}**\n`;
        murdererStats += `\`•\` Mortes como Assassino: **${deaths}**\n\n`;
        murdererStats += `\`•\` Vitórias como Assassino: **${wins}**\n`;
        murdererStats += `\`•\` Derrotas como Assassino: **${losses}**\n`;
        murdererStats += `\`•\` Partidas jogadas como Assassino: **${played}**\n\n`;
        murdererStats += `\`•\` Winstreak como Assassino: **${winStreak}**\n`;
        murdererStats += `\`•\` KDR como Assassino: **${(kills / deaths).toFixed(2)}**`;

        let totalStats = `\`•\` Jogador » **${account.username}**\n`;
        totalStats += `\`•\` Esmeraldas recolhidas: **${coinsPickedUp}**\n\n`;
        totalStats += `\`•\` Abates totais: **${kills}**\n`;
        totalStats += `\`•\` Mortes totais: **${deaths}**\n`;
        totalStats += `\`•\` Abates como Assassino: **${kills}**\n\n`;
        totalStats += `\`•\` Vitórias totais: **${wins}**\n`;
        totalStats += `\`•\` Derrotas totais: **${losses}**\n`;
        totalStats += `\`•\` Partidas jogadas totais: **${played}**\n\n`;
        totalStats += `\`•\` Winstreak total: **${winStreak}**\n`;
        totalStats += `\`•\` WLR total: **${winLossRatio}**`;

        let skinUrl;
        if (account.unique_id) {
          const uuid = account.unique_id.replace(/-/g, "");
          skinUrl = `https://visage.surgeplay.com/face/${uuid}.png`;
        } else {
          skinUrl = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7";
        }

        const embed = new MessageEmbed()
          .setAuthor(`Estatísticas de Murder » ${account.username}`, `https://imgur.com/HiJoDLK.png`)
          .setColor("#2f3136")
          .setThumbnail(skinUrl)
          .setDescription(description)
          .setFooter({
            text: "Desenvolvido por Awesoming",
            iconURL: "https://cdn.discordapp.com/avatars/354304147920519169/5b01129d18e3b550c73f5c5a970dbc88.png?size=2048",
          });

        const actionRow = new MessageActionRow()
          .addComponents(
            new MessageButton()
            .setCustomId("total")
            .setLabel("Total")
            .setStyle("SECONDARY"),
            new MessageButton()
              .setCustomId("innocent")
              .setLabel("Inocente")
              .setStyle("PRIMARY"),
            new MessageButton()
              .setCustomId("detective")
              .setLabel("Detetive")
              .setStyle("SUCCESS"),
            new MessageButton()
              .setCustomId("murderer")
              .setLabel("Assassino")
              .setStyle("DANGER"),
          );

        await interaction.reply({ embeds: [embed], components: [actionRow] });
        const reply = await interaction.fetchReply();

        const filter = (interaction) => interaction.user.id === interaction.user.id;
        const collector = reply.createMessageComponentCollector({ filter, time: 15000 });

        collector.on("collect", async (interaction) => {
          if (interaction.customId === "innocent") {
            embed.setDescription(innocentStats);
          } else if (interaction.customId === "detective") {
            embed.setDescription(detectiveStats);
          } else if (interaction.customId === "murderer") {
            embed.setDescription(murdererStats);
          } else if (interaction.customId === "total") {
            embed.setDescription(totalStats);
          }

          await interaction.update({ embeds: [embed] });
        });

        collector.on("end", () => {
          actionRow.components.forEach((component) => component.setDisabled(true));
          interaction.editReply({ components: [actionRow] });
        });
      } catch (error) {
        console.error("[Perfil]", "Erro ao obter as estatísticas de Murder:", error);
        await interaction.reply(`\`❌\` » Ocorreu um erro ao obter as estatísticas de Murder Mystery do jogador.`);
      }
    }
  },
};