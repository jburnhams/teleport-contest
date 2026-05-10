import fs from 'fs';

let jsOutput = "import * as C from './const.js';\n\nexport const roles = [\n";

// We need to regenerate js/roles.js as it somehow got lost/reset
const cText = fs.readFileSync('/tmp/roles_intermediate.js', 'utf8');
let text = cText.substring(cText.indexOf('{') + 1, cText.lastIndexOf('}'));

function extractArrayItems(str) {
    let items = [];
    let current = "";
    let depth = 0;
    let inString = false;

    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        if (char === '"' && str[i-1] !== '\\') {
            inString = !inString;
        }

        if (!inString) {
            if (char === '{') depth++;
            if (char === '}') depth--;
        }

        if (depth === 0 && char === ',' && !inString) {
            items.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    if (current.trim() !== "") {
        items.push(current.trim());
    }
    return items;
}

const roleBlocks = extractArrayItems(text);
roleBlocks.forEach(block => {
    if (block === "{ 0 }" || block === "{ { 0 } }") return;
    if (!block.startsWith('{')) return;

    let inner = block.substring(1, block.length - 1).trim();
    let fields = extractArrayItems(inner);
    if (fields.length < 32) return;

    let name = fields[0];
    let ranks = fields[1];
    let parseName = (str) => {
        let parts = extractArrayItems(str.substring(1, str.length - 1));
        return `{ m: ${parts[0]}, f: ${parts[1]} }`;
    };

    let jsName = parseName(name);
    let rankInner = ranks.substring(1, ranks.length - 1).trim();
    let rankParts = extractArrayItems(rankInner);
    let jsRanks = `[\n            ${rankParts.map(parseName).join(',\n            ')}\n        ]`;

    jsOutput += `    {\n`;
    jsOutput += `        name: ${jsName},\n`;
    jsOutput += `        rank: ${jsRanks},\n`;
    jsOutput += `        lgod: ${fields[2]},\n`;
    jsOutput += `        ngod: ${fields[3]},\n`;
    jsOutput += `        cgod: ${fields[4]},\n`;
    jsOutput += `        filecode: ${fields[5]},\n`;
    jsOutput += `        homebase: ${fields[6]},\n`;
    jsOutput += `        intermed: ${fields[7]},\n`;
    jsOutput += `        mnum: ${fields[8]},\n`;
    jsOutput += `        petnum: ${fields[9]},\n`;
    jsOutput += `        ldrnum: ${fields[10]},\n`;
    jsOutput += `        guardnum: ${fields[11]},\n`;
    jsOutput += `        neminum: ${fields[12]},\n`;
    jsOutput += `        enemy1num: ${fields[13]},\n`;
    jsOutput += `        enemy2num: ${fields[14]},\n`;
    jsOutput += `        enemy1sym: ${fields[15]},\n`;
    jsOutput += `        enemy2sym: ${fields[16]},\n`;
    jsOutput += `        questarti: ${fields[17]},\n`;
    jsOutput += `        allow: ${fields[18]},\n`;

    let attrbase = fields[19];
    jsOutput += `        attrbase: [ ${attrbase.substring(1, attrbase.length - 1)} ],\n`;
    let attrdist = fields[20];
    jsOutput += `        attrdist: [ ${attrdist.substring(1, attrdist.length - 1)} ],\n`;
    let hpadv = extractArrayItems(fields[21].substring(1, fields[21].length - 1));
    jsOutput += `        hpadv: { infix: ${hpadv[0]}, inrnd: ${hpadv[1]}, lofix: ${hpadv[2]}, lornd: ${hpadv[3]}, hifix: ${hpadv[4]}, hirnd: ${hpadv[5]} },\n`;
    let enadv = extractArrayItems(fields[22].substring(1, fields[22].length - 1));
    jsOutput += `        enadv: { infix: ${enadv[0]}, inrnd: ${enadv[1]}, lofix: ${enadv[2]}, lornd: ${enadv[3]}, hifix: ${enadv[4]}, hirnd: ${enadv[5]} },\n`;

    jsOutput += `        xlev: ${fields[23]},\n        initrecord: ${fields[24]},\n        spelbase: ${fields[25]},\n        spelheal: ${fields[26]},\n        spelshld: ${fields[27]},\n        spelarmr: ${fields[28]},\n        spelstat: ${fields[29]},\n        spelspec: ${fields[30]},\n        spelsbon: ${fields[31]}\n    },\n`;
});
jsOutput += `];\n`;

let textRacesStr = fs.readFileSync('/tmp/races_c.txt', 'utf8');
function processCStructToJs(text) {
    text = text.replace(/\/\*[\s\S]*?\*\//g, '');
    text = text.replace(/#if 0[\s\S]*?#endif/g, '');
    text = text.replace(/NON_PM/g, 'C.NON_PM');
    let prefixes = ['PM_', 'MH_', 'ROLE_', 'S_', 'A_', 'SPE_', 'ART_', 'AM_'];
    for (let p of prefixes) {
        text = text.replace(new RegExp('\\b(' + p + '[A-Za-z0-9_]+)\\b', 'g'), 'C.$1');
    }
    text = text.replace(/STR18\(([0-9]+)\)/g, '118');
    return text;
}
let textRacesProc = processCStructToJs(textRacesStr);
let textRacesInner = textRacesProc.substring(textRacesProc.indexOf('{') + 1, textRacesProc.lastIndexOf('}'));
const raceBlocks = extractArrayItems(textRacesInner);

jsOutput += `\nexport const races = [\n`;
raceBlocks.forEach(block => {
    if (block === "{ 0 }" || block === "{ { 0 } }") return;
    if (!block.startsWith('{')) return;
    let inner = block.substring(1, block.length - 1).trim();
    let fields = extractArrayItems(inner);
    if (fields.length < 16) return;

    jsOutput += `    {\n        noun: ${fields[0]},\n        adj: ${fields[1]},\n        coll: ${fields[2]},\n        filecode: ${fields[3]},\n`;
    let nameParts = extractArrayItems(fields[4].substring(1, fields[4].length - 1));
    jsOutput += `        individual: { m: ${nameParts[0]}, f: ${nameParts[1]} },\n`;
    jsOutput += `        mnum: ${fields[5]},\n        mummynum: ${fields[6]},\n        zombienum: ${fields[7]},\n        allow: ${fields[8]},\n        selfmask: ${fields[9]},\n        lovemask: ${fields[10]},\n        hatemask: ${fields[11]},\n`;
    let attrmin = fields[12];
    jsOutput += `        attrmin: [ ${attrmin.substring(1, attrmin.length - 1)} ],\n`;
    let attrmax = fields[13];
    jsOutput += `        attrmax: [ ${attrmax.substring(1, attrmax.length - 1).replace(/118/g, 'C.STR18(100)')} ],\n`;
    let hpadv = extractArrayItems(fields[14].substring(1, fields[14].length - 1));
    jsOutput += `        hpadv: { infix: ${hpadv[0]}, inrnd: ${hpadv[1]}, lofix: ${hpadv[2]}, lornd: ${hpadv[3]}, hifix: ${hpadv[4]}, hirnd: ${hpadv[5]} },\n`;
    let enadv = extractArrayItems(fields[15].substring(1, fields[15].length - 1));
    jsOutput += `        enadv: { infix: ${enadv[0]}, inrnd: ${enadv[1]}, lofix: ${enadv[2]}, lornd: ${enadv[3]}, hifix: ${enadv[4]}, hirnd: ${enadv[5]} }\n    },\n`;
});
jsOutput += `];\n`;

jsOutput += `
export const genders = [
    { name: "male", he: "he", him: "him", his: "his", filecode: "Mal", allow: C.ROLE_MALE },
    { name: "female", he: "she", him: "her", his: "her", filecode: "Fem", allow: C.ROLE_FEMALE },
    { name: "neuter", he: "it", him: "it", his: "its", filecode: "Ntr", allow: C.ROLE_NEUTER },
    { name: "group", he: "they", him: "them", his: "their", filecode: "Grp", allow: 0 }
];

export const aligns = [
    { noun: "law", adj: "lawful", filecode: "Law", allow: C.ROLE_LAWFUL, value: C.A_LAWFUL },
    { noun: "balance", adj: "neutral", filecode: "Neu", allow: C.ROLE_NEUTRAL, value: C.A_NEUTRAL },
    { noun: "chaos", adj: "chaotic", filecode: "Cha", allow: C.ROLE_CHAOTIC, value: C.A_CHAOTIC },
    { noun: "evil", adj: "unaligned", filecode: "Una", allow: 0, value: C.A_NONE }
];

export function findRole(name) {
    if (!name) return null;
    const lc = name.toLowerCase();
    return roles.find(r => r.name.m.toLowerCase() === lc || (r.name.f && String(r.name.f).toLowerCase() === lc));
}

export function findRace(name) {
    if (!name) return null;
    const lc = name.toLowerCase();
    return races.find(r => r.noun.toLowerCase() === lc);
}
`;

fs.writeFileSync('js/roles.js', jsOutput);
