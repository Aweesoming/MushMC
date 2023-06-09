const { Client, Interaction } = require("discord.js");

module.exports = {
    name: "interactionCreate",

    /**
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    run: (client, interaction) => {
        if (!interaction.isCommand()) return;

        let cmd = client.commands.get(interaction.commandName);
        if (cmd) {
            try {
                cmd.run(client, interaction);
            } catch(e) {
                interaction.reply({
                    content: "Ocorreu um erro ao executar esse comando. Tente novamente mais tarde.",
                    ephemeral: true
                });

                console.error(`Falha ao executar o comando ${cmd.name}:`, e);
            }
        }
    }
}