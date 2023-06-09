const { readdirSync } = require("fs");
const path = require("path");

module.exports = (client) => {
    let commandList = readdirSync(path.resolve(__dirname, "../events"));

    commandList.forEach(file => {
        if (!file.endsWith(".js")) return;

        let fileName = file.split(".")[0];
        
        try {
            let event = require(`../events/${fileName}`);

            client.on(event.name, event.run.bind(event, client))
        } catch(e) {
            console.error(`Falha ao carregar o evento ${file}:`, e);
        }
    });
}