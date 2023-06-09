const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
  name: "perfil",
  description: "Mostra estatísticas de minigames do jogador.",
  options: [
    {
      type: "STRING",
      name: "jogador",
      description: "Nome do jogador a ser verificado.",
      required: true,
    },
  ],

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const usernameParam = interaction.options.getString("jogador")?.toLowerCase();
    if (!usernameParam) return;

    try {
      const playerResponse = await fetch(`https://mush.com.br/api/player/${usernameParam}`);
      const playerData = await playerResponse.json();

      if (!playerData || !playerData.success || !playerData.response || !playerData.response.account) {
        return await interaction.reply(`\`❌\` » Esse jogador não está registrado no servidor.`);
      }

      const { account, connected, rank, clan, banned, muted } = playerData.response;

      let connectedStatus = connected ? "Online" : "Offline";
      let rankTitle = rank ? rank.title ?? "Desconhecido" : "Desconhecido";
      let accountType = account.type === "PREMIUM" ? "Original" : "Alternativa";
      let clanName = clan && clan.name ? clan.name : "Sem clã";
      let banStatus = banned ? "Sim" : "Não";
      let muteStatus = muted ? "Sim" : "Não";

      moment.locale("pt-br");

      const lastLoginTimestamp = playerData.response.last_login;
      const lastLoginDate = lastLoginTimestamp ? moment(lastLoginTimestamp) : null;
      const currentTime = moment();
      let lastLogin = "Desconhecido";

      if (lastLoginDate) {
        lastLogin = lastLoginDate.from(currentTime);
      }

      const firstLoginTimestamp = playerData.response.first_login;
      const firstLoginDate = firstLoginTimestamp ? moment(firstLoginTimestamp) : null;
      let firstLogin = "Desconhecido";

      if (firstLoginDate) {
        firstLogin = firstLoginDate.from(currentTime);
      }

      let description = `\`•\` Jogador » **${account.username}**\n`;
      description += `\`•\` Rank » **${rankTitle}**\n`;
      description += `\`•\` Clã » **${clanName}**\n\n`;
      description += `\`•\` Tipo de conta » **${accountType}**\n`;
      description += `\`•\` Status » **${connectedStatus}**\n\n`;
      description += `\`•\` Último login » **${lastLogin}**\n`;
      description += `\`•\` Primeiro login » **${firstLogin}**\n\n`;
      description += `\`•\` Banido » **${banStatus}**\n`;
      description += `\`•\` Silenciado » **${muteStatus}**\n`;

      let skinUrl;
      if (account.unique_id) {
        const uuid = account.unique_id.replace(/-/g, ""); // Remover os traços "-" do UUID
        skinUrl = `https://visage.surgeplay.com/face/${uuid}.png`;
      } else {
        skinUrl = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7";
      }
      
      const embed = new MessageEmbed()
        .setAuthor(`Perfil » ${account.username}`, `https://imgur.com/BYQgiDa.png`)
        .setColor("#2f3136")
        .setDescription(description)
        .setThumbnail(skinUrl)
        .setFooter({
          text: "Desenvolvido por Awesoming",
          iconURL:
            "https://cdn.discordapp.com/avatars/354304147920519169/5b01129d18e3b550c73f5c5a970dbc88.png?size=2048",
        });

      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error("[Perfil]", `Erro ao obter informações do jogador ${usernameParam}:`, error);
      return await interaction.reply(`\`❌\` » Ocorreu um erro ao buscar informações do jogador.`);
    }
  },
};
