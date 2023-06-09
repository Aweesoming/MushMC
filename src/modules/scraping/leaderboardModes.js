const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Coleta e retorna lista de modos do leaderboard.
 * @returns {Promise<object>}
 */
module.exports = async () => {
    let data = [];

    let res = await axios.get(`https://mush.com.br/leaderboard/hg`);
    let $ = cheerio.load(res.data);

    let navbar = $(".leaderboard-navbar > li > a");
    for (let elem of navbar) {
        data.push({
            id: elem.attribs.href.match(/\w+$/gi)[0],
            title: elem.children[0].data,
            url: elem.attribs.href
        });
    }

    return data;
}