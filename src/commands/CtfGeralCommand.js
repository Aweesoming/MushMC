const { Client, CommandInteraction, MessageEmbed } = require("discord.js");

module.exports = {
  name: "ctf",
  description: "Estatísticas de CTF do jogador.",
  options: [
    {
      type: "SUB_COMMAND",
      name: "geral",
      description: "Mostra as estatísticas completas de CTF do jogador.",
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

        const ctfStats = stats.ctf || {}; // Adicionado verificação de existência

        let coins = ctfStats.coins ?? 0;
        let gamesPlayed = ctfStats.games_played ?? 0;
        let captures = ctfStats.captures ?? 0;
        let recaptures = ctfStats.returns ?? 0;
        let kills = ctfStats.kills ?? 0;

        let description = `\`•\` Jogador » **${account.username}**\n`;
        description += `\`•\` Coins » **${coins}**\n\n`;
        description += `\`•\` Abates » **${kills}**\n`;
        description += `\`•\` Partidas jogadas » **${gamesPlayed}**\n`;
        description += `\`•\` Bandeiras capturadas » **${captures}**\n`;
        description += `\`•\` Bandeiras recuperadas » **${recaptures}**`;

        let skinUrl;
        if (account.unique_id) {
          const uuid = account.unique_id.replace(/-/g, "");
          skinUrl = `https://visage.surgeplay.com/face/${uuid}.png`;
        } else {
          skinUrl = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7";
        }

        const embed = new MessageEmbed()
          .setAuthor(`Estatísticas de CTF » ${account.username}`, `https://imgur.com/oBOhtgO.png`)
          .setColor("#2f3136")
          .setThumbnail(skinUrl)
          .setDescription(description)
          .setFooter({
            text: "Desenvolvido por Awesoming",
            iconURL: "https://cdn.discordapp.com/avatars/354304147920519169/5b01129d18e3b550c73f5c5a970dbc88.png?size=2048",
          });

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error("[Perfil]", "Erro ao obter as estatísticas de CTF:", error);
        await interaction.reply(`\`❌\` » Ocorreu um erro ao obter as estatísticas de CTF do jogador.`);
      }
    }
  },
};