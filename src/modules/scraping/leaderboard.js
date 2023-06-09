const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Coleta e retorna dados de leaderboard de um minigame.
 * @param {string} id Id do minigame.
 * @returns {Promise<object>}
 */
module.exports = async (id) => {
    let data = {
        colums: [],
        rows: []
    }
    
    let res = await axios.get(`https://mush.com.br/leaderboard/${id}`);
    let $ = cheerio.load(res.data);

    for (let colum of $("thead > tr > th")) {
        data.colums.push(colum.children[0].data.trim());
    }

    let rows = (await axios.get(`https://mush.com.br/api/leaderboard/${id}`)).data.records;

    // Busco alternativas melhores de organização (faça um Pull Request).   
    for (let row of rows) {  
        let keys = Object.keys(row);

        let monthly = row[keys.find((_, i) => /\d/.test(keys[i]))];
        let wins = row[keys.find((_, i) => /wins(t{0})/.test(keys[i]))];
        let kills = row[keys.find((_, i) => /kills/.test(keys[i]))] ?? 0;
        let deaths = row[keys.find((_, i) => /deaths|losses/.test(keys[i]))] ?? 0;
        let winstreak = row[keys.find((_, i) => /winstreak/.test(keys[i]))];
        let kdr = (Math.round((kills / deaths) * 100) / 100) || 0;

        switch(id) {
            case "hg":
            case "minimush":
                data.rows.push([row.pos, row.account.username, monthly, wins, kills, deaths, kdr]);
                break;
            case "pvp":
                data.rows.push([row.pos, row.account.username, kills, deaths, kdr]);
                break;
            case "soup":
            case "gladiator":
                data.rows.push([row.pos, row.account.username, monthly, wins, deaths, winstreak]);
                break;
            case "skywars":
                data.rows.push([row.pos, row.account.username, wins, kills, deaths, row["skywars_r1:coins"]]);
                break;
            case "party":
                data.rows.push([row.pos, row.account.username, row["party:points"], row["party:first_place"], row["party:second_place"], row["party:third_place"]]);
                break;
            case "ctf":
                data.rows.push([row.pos, row.account.username, row["ctf:captures"], kills]);
                break;
            case "bedwars":
                data.rows.push([row.pos, row.account.username, wins, kills, row["bedwars:final_kills"]]);
                break;
            case "bridge":
                data.rows.push([row.pos, row.account.username, wins, deaths, row["duels:bridge_points"]]);
                break;
            case "quickbuilders":
                data.rows.push([row.pos, row.account.username, wins, deaths, row["quickbuilders:perfect_builds"], row["quickbuilders:builds"]]);
                break;
            default:
                throw new Error("Unknown minigame");
        }
    }
    
    return data;
}