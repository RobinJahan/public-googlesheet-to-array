const axios = require('axios');
const parser = require('html-dom-parser');

function getGoogle(url, sheetName) {
    axios.get(url)
        .then(function (response) {

            const sheet = response.data.substring(
                response.data.lastIndexOf("<ul"),
                response.data.lastIndexOf("</ul>") + 5
            );

            const htmlSheet = parser(sheet)
            const sheetList = htmlSheet[0].children.filter(e => 'li' === e.name).map(e => e.children[0].children[0].data)

            let sheetIndex = 0

            if (sheetName) {
                sheetIndex = sheetList.indexOf(sheetName)
                if (sheetIndex == -1) {
                    console.error(`The sheet ${sheetName} does not existe`)
                    sheetIndex = 0
                }
            }

            const tableArray = response.data
                .split('<table')
                .map(e => '<table' + e)
                .filter(a => a.indexOf('</table>') !== -1)
                .map(e => e.substring(
                    e.lastIndexOf("<table"),
                    e.lastIndexOf("</table>") + 8
                ))

            const html = parser(tableArray[sheetIndex])

            let array = [];
            const header = [];

            const table = html.find(t => 'table' === t.name)
            const tbody = table.children.find(t => 'tbody' === t.name)
            const tr = tbody.children.filter(t => 'tr' === t.name)

            let line = 1
            tr.forEach(etr => {
                let json = {};
                const td = etr.children.filter(t => 'td' === t.name)
                let column = 1
                td.forEach(etd => {
                    if (etd.children[0]) {
                        const text = etd.children[0].data;
                        1 === line ? header.push(text) : json[header[column - 1]] = text;
                        column++
                    }
                })
                1 === line ? null : array.push(json);
                line++;
            });
            console.log(array)
        })
        .catch(function (error) {
            console.error(error);
        })
}

module.exports = { getGoogle }

