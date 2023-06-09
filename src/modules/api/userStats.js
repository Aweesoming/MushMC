const axios = require("axios");

/**
 * Coleta e retorna dados de minigame do jogador.
 * @param {string} user Usuário a ser checado.
 * @returns {Promise<object>}
 */
 module.exports = async (user) => {
    let res = await axios.get(`https://mush.com.br/api/player/${user}`);
    if (!res.data.success || !res.data.response) {
        throw new Error("Jogador inválido");
    }

    return res.data.response;
 }