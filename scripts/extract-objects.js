import fs from 'fs';

const text = fs.readFileSync('nethack-c/upstream/include/objects.h', 'utf8');

let objStrs = [];

let inObj = false;
let currObj = "";
let parenLevel = 0;

const lines = text.split('\n');
for (let line of lines) {
    let match = line.match(/^(OBJECT|WEAPON|ARMOR|POTION|RING|AMULET|TOOL|CONTAINER|FOOD|SCROLL|SPELL|WAND|COIN|GEM|ROCK|VENOM|GENERIC|PROJECTILE|BOW|BULLET)\s*\(/);

    if (!inObj) {
        if (match) {
            inObj = true;
            currObj = line;
            parenLevel = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
        }
    } else {
        currObj += "\n" + line;
        parenLevel += (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
    }

    if (inObj && parenLevel === 0) {
        objStrs.push(currObj);
        inObj = false;
    }
}

if (objStrs.length > 0 && objStrs[objStrs.length - 1].includes("NoDes, NoDes")) {
    objStrs.pop();
}

function parseArgs(argsStr) {
    let args = [];
    let currentArg = "";
    let depth = 0;
    let inString = false;
    let inChar = false;
    for (let i = 0; i < argsStr.length; i++) {
        const char = argsStr[i];
        if (char === '"' && argsStr[i-1] !== '\\' && !inChar) {
            inString = !inString;
            currentArg += char;
        } else if (char === "'" && argsStr[i-1] !== '\\' && !inString) {
            inChar = !inChar;
            currentArg += char;
        } else if (!inString && !inChar && char === '(') {
            depth++;
            currentArg += char;
        } else if (!inString && !inChar && char === ')') {
            depth--;
            currentArg += char;
        } else if (!inString && !inChar && char === ',' && depth === 0) {
            args.push(currentArg.trim());
            currentArg = "";
        } else {
            currentArg += char;
        }
    }
    if (currentArg.trim() !== "") {
        args.push(currentArg.trim());
    }
    return args;
}

let parsedObjects = [];
for (let str of objStrs) {
    str = str.trim();
    let cleanStr = "";
    let inString = false;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '"' && str[i-1] !== '\\') {
            inString = !inString;
        }
        if (!inString && (str[i] === '\n' || str[i] === '\r')) {
            cleanStr += " ";
        } else {
            cleanStr += str[i];
        }
    }

    cleanStr = cleanStr.replace(/\/\*[\s\S]*?\*\//g, '');
    cleanStr = cleanStr.replace(/\\\s/g, ' ');
    cleanStr = cleanStr.replace(/\s+/g, ' ');
    cleanStr = cleanStr.replace(/,\s*$/, '');

    const match = cleanStr.match(/^(OBJECT|WEAPON|ARMOR|POTION|RING|AMULET|TOOL|CONTAINER|FOOD|SCROLL|SPELL|WAND|COIN|GEM|ROCK|VENOM|GENERIC|PROJECTILE|BOW|BULLET)\s*\(([\s\S]*)\)$/);
    if (!match) continue;

    const macro = match[1];
    let argsStr = match[2];
    const args = parseArgs(argsStr);

    for (let i = 0; i < args.length; i++) {
        if (args[i] === 'NoDes') args[i] = 'null';
    }

    let parsed = { macro, sn: args[args.length - 1] };

    if (macro === 'OBJECT') {
        const objArgs = parseArgs(args[0].match(/^OBJ\((.*)\)$/)[1]);
        parsed.name = objArgs[0];
        parsed.desc = objArgs[1] === 'NoDes' ? 'null' : objArgs[1];
        const bitsArgs = parseArgs(args[1].match(/^BITS\((.*)\)$/)[1]);
        parsed.nmkn = bitsArgs[0];
        parsed.mrg = bitsArgs[1];
        parsed.uskn = bitsArgs[2];
        parsed.ctnr = bitsArgs[3];
        parsed.mgc = bitsArgs[4];
        parsed.chrg = bitsArgs[5];
        parsed.uniq = bitsArgs[6];
        parsed.nwsh = bitsArgs[7];
        parsed.big = bitsArgs[8];
        parsed.tuf = bitsArgs[9];
        parsed.dir = bitsArgs[10];
        parsed.sub = bitsArgs[11];
        parsed.mtrl = bitsArgs[12];
        parsed.power = args[2];
        parsed.class = args[3];
        parsed.prob = args[4];
        parsed.delay = args[5];
        parsed.wt = args[6];
        parsed.cost = args[7];
        parsed.sdam = args[8];
        parsed.ldam = args[9];
        parsed.oc1 = args[10];
        parsed.oc2 = args[11];
        parsed.nut = args[12];
        parsed.color = args[13];
    } else if (macro === 'GENERIC') {
        parsed.name = args[0];
        parsed.desc = args[0];
        parsed.class = args[1];
        parsed.nmkn = 0;
        parsed.mrg = 0;
        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.mgc = 0;
        parsed.chrg = 0;
        parsed.uniq = 0;
        parsed.nwsh = 1;
        parsed.big = 0;
        parsed.tuf = 0;
        parsed.dir = 0;
        parsed.sub = 'P_NONE';
        parsed.mtrl = 0;
        parsed.power = 0;
        parsed.prob = 0;
        parsed.delay = 0;
        parsed.wt = 0;
        parsed.cost = 0;
        parsed.sdam = 0;
        parsed.ldam = 0;
        parsed.oc1 = 0;
        parsed.oc2 = 0;
        parsed.nut = 0;
        parsed.color = 'CLR_GRAY';
    } else if (macro === 'WEAPON') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.nmkn = args[2];
        parsed.mgc = args[3];
        parsed.big = args[4];
        parsed.prob = args[5];
        parsed.wt = args[6];
        parsed.cost = args[7];
        parsed.sdam = args[8];
        parsed.ldam = args[9];
        parsed.oc1 = args[10];
        parsed.class = 'WEAPON_CLASS';
        parsed.dir = args[11]; // typ is dir for WEAPON
        parsed.sub = args[12];
        parsed.mtrl = args[13];
        parsed.color = args[14];

        parsed.mrg = 1;
        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.chrg = 1;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.tuf = 0;
        parsed.power = 0;
        parsed.delay = 0;
        parsed.oc2 = 0;
        parsed.nut = parsed.wt;
    } else if (macro === 'PROJECTILE') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.nmkn = args[2];
        parsed.mgc = 0;
        parsed.big = 0;
        parsed.prob = args[3];
        parsed.wt = args[4];
        parsed.cost = args[5];
        parsed.sdam = args[6];
        parsed.ldam = args[7];
        parsed.oc1 = args[8];
        parsed.class = 'WEAPON_CLASS';
        parsed.dir = 'PIERCE'; // PROJECTILE uses PIERCE
        parsed.mtrl = args[9];
        parsed.sub = args[10];
        parsed.color = args[11];

        parsed.mrg = 1;
        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.chrg = 1;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.tuf = 0;
        parsed.power = 0;
        parsed.delay = 0;
        parsed.oc2 = 0;
        parsed.nut = parsed.wt;
    } else if (macro === 'BOW') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.nmkn = args[2];
        parsed.mgc = 0;
        parsed.big = 0;
        parsed.prob = args[3];
        parsed.wt = args[4];
        parsed.cost = args[5];
        parsed.sdam = 2;
        parsed.ldam = 2;
        parsed.oc1 = args[6];
        parsed.class = 'WEAPON_CLASS';
        parsed.dir = 0;
        parsed.mtrl = args[7];
        parsed.sub = args[8];
        parsed.color = args[9];

        parsed.mrg = 1;
        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.chrg = 1;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.tuf = 0;
        parsed.power = 0;
        parsed.delay = 0;
        parsed.oc2 = 0;
        parsed.nut = parsed.wt;
    } else if (macro === 'BULLET') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.nmkn = args[2];
        parsed.mgc = 0;
        parsed.big = 0;
        parsed.prob = args[3];
        parsed.wt = args[4];
        parsed.cost = args[5];
        parsed.sdam = args[6];
        parsed.ldam = args[7];
        parsed.oc1 = args[8];
        parsed.class = 'WEAPON_CLASS';
        parsed.dir = 'PIERCE';
        parsed.mtrl = args[9];
        parsed.sub = args[10];
        parsed.color = args[11];

        parsed.mrg = 1;
        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.chrg = 1;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.tuf = 0;
        parsed.power = 0;
        parsed.delay = 0;
        parsed.oc2 = 0;
        parsed.nut = parsed.wt;
    } else if (macro === 'ARMOR') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.nmkn = args[2];
        parsed.mgc = args[3];
        parsed.big = args[4];
        parsed.power = args[5];
        parsed.prob = args[6];
        parsed.delay = args[7];
        parsed.wt = args[8];
        parsed.cost = args[9];
        parsed.oc1 = `10 - ${args[10]}`;
        parsed.oc2 = args[11];
        parsed.sub = args[12];
        parsed.mtrl = args[13];
        parsed.color = args[14];
        parsed.class = 'ARMOR_CLASS';

        parsed.mrg = 0;
        parsed.uskn = 1;
        parsed.ctnr = 0;
        parsed.chrg = 1;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.tuf = 0;
        parsed.dir = 0;
        parsed.sdam = 0;
        parsed.ldam = 0;
        parsed.nut = parsed.wt;
    } else if (macro === 'POTION') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.mgc = args[2];
        parsed.power = args[3];
        parsed.prob = args[4];
        parsed.cost = args[5];
        parsed.color = args[6];
        parsed.class = 'POTION_CLASS';

        parsed.nmkn = 0;
        parsed.mrg = 1;
        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.chrg = 0;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.big = 0;
        parsed.tuf = 0;
        parsed.dir = 0;
        parsed.sub = 'P_NONE';
        parsed.mtrl = 'GLASS';
        parsed.delay = 0;
        parsed.wt = 20;
        parsed.sdam = 0;
        parsed.ldam = 0;
        parsed.oc1 = 0;
        parsed.oc2 = 0;
        parsed.nut = 10;
    } else if (macro === 'RING') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.power = args[2];
        parsed.cost = args[3];
        parsed.mgc = args[4];
        let spec = args[5];
        let mohs = args[6];
        parsed.mtrl = args[7];
        parsed.color = args[8];
        parsed.class = 'RING_CLASS';

        parsed.nmkn = 0;
        parsed.mrg = 0;
        parsed.uskn = spec;
        parsed.ctnr = 0;
        parsed.chrg = spec;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.big = 0;
        parsed.tuf = `HARDGEM(${mohs})`;
        parsed.dir = 0;
        parsed.sub = 'P_NONE';
        parsed.prob = 1;
        parsed.delay = 0;
        parsed.wt = 3;
        parsed.sdam = 0;
        parsed.ldam = 0;
        parsed.oc1 = 0;
        parsed.oc2 = 0;
        parsed.nut = 15;
    } else if (macro === 'AMULET') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.power = args[2];
        parsed.prob = args[3];
        parsed.class = 'AMULET_CLASS';
        parsed.sn = args[4];

        parsed.nmkn = 0;
        parsed.mrg = 0;
        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.mgc = 1;
        parsed.chrg = 0;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.big = 0;
        parsed.tuf = 0;
        parsed.dir = 0;
        parsed.sub = 'P_NONE';
        parsed.mtrl = 'IRON';
        parsed.delay = 0;
        parsed.wt = 20;
        parsed.cost = 150;
        parsed.sdam = 0;
        parsed.ldam = 0;
        parsed.oc1 = 0;
        parsed.oc2 = 0;
        parsed.nut = 20;
        parsed.color = 'HI_METAL';
    } else if (macro === 'TOOL') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.nmkn = args[2];
        parsed.mrg = args[3];
        parsed.mgc = args[4];
        let chg = args[5];
        parsed.prob = args[6];
        parsed.wt = args[7];
        parsed.cost = args[8];
        parsed.mtrl = args[9];
        parsed.color = args[10];
        parsed.class = 'TOOL_CLASS';

        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.chrg = chg;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.big = 0;
        parsed.tuf = 0;
        parsed.dir = 0;
        parsed.sub = 'P_NONE';
        parsed.power = 0;
        parsed.delay = 0;
        parsed.sdam = 0;
        parsed.ldam = 0;
        parsed.oc1 = 0;
        parsed.oc2 = 0;
        parsed.nut = parsed.wt;
    } else if (macro === 'CONTAINER') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.nmkn = args[2];
        parsed.mgc = args[3];
        let chg = args[4];
        parsed.prob = args[5];
        parsed.wt = args[6];
        parsed.cost = args[7];
        parsed.mtrl = args[8];
        parsed.color = args[9];
        parsed.class = 'TOOL_CLASS';

        parsed.mrg = 0;
        parsed.uskn = 0;
        parsed.ctnr = 1;
        parsed.chrg = chg;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.big = 0;
        parsed.tuf = 0;
        parsed.dir = 0;
        parsed.sub = 'P_NONE';
        parsed.power = 0;
        parsed.delay = 0;
        parsed.sdam = 0;
        parsed.ldam = 0;
        parsed.oc1 = 0;
        parsed.oc2 = 0;
        parsed.nut = parsed.wt;
    } else if (macro === 'FOOD') {
        parsed.name = args[0];
        parsed.desc = 'null';
        let prob = args[1];
        let delay = args[2];
        let wt = args[3];
        let unk = args[4];
        let tin = args[5];
        let nutrition = args[6];
        let color = args[7];

        parsed.nmkn = 1;
        parsed.mrg = 1;
        parsed.uskn = unk;
        parsed.ctnr = 0;
        parsed.mgc = 0;
        parsed.chrg = 0;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.big = 0;
        parsed.tuf = 0;
        parsed.dir = 0;
        parsed.sub = 'P_NONE';
        parsed.mtrl = tin;
        parsed.power = 0;
        parsed.class = 'FOOD_CLASS';
        parsed.prob = prob;
        parsed.delay = delay;
        parsed.wt = wt;
        parsed.cost = `${nutrition} / 20 + 5`;
        parsed.sdam = 0;
        parsed.ldam = 0;
        parsed.oc1 = 0;
        parsed.oc2 = 0;
        parsed.nut = nutrition;
        parsed.color = color;
    } else if (macro === 'SCROLL') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.mgc = args[2];
        parsed.prob = args[3];
        parsed.cost = args[4];
        parsed.class = 'SCROLL_CLASS';

        parsed.nmkn = 0;
        parsed.mrg = 1;
        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.chrg = 0;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.big = 0;
        parsed.tuf = 0;
        parsed.dir = 0;
        parsed.sub = 'P_NONE';
        parsed.mtrl = 'PAPER';
        parsed.power = 0;
        parsed.delay = 0;
        parsed.wt = 5;
        parsed.sdam = 0;
        parsed.ldam = 0;
        parsed.oc1 = 0;
        parsed.oc2 = 0;
        parsed.nut = 6;
        parsed.color = 'HI_PAPER';
    } else if (macro === 'SPELL') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.sub = args[2];
        parsed.prob = args[3];
        parsed.delay = args[4];
        let level = args[5];
        parsed.mgc = args[6];
        parsed.dir = args[7];
        parsed.color = args[8];
        parsed.class = 'SPBOOK_CLASS';

        parsed.nmkn = 0;
        parsed.mrg = 0;
        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.chrg = 0;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.big = 0;
        parsed.tuf = 0;
        parsed.mtrl = 'PAPER';
        parsed.power = 0;
        parsed.wt = 50;
        parsed.cost = `${level} * 100`;
        parsed.sdam = 0;
        parsed.ldam = 0;
        parsed.oc1 = 0;
        parsed.oc2 = level;
        parsed.nut = 20;
    } else if (macro === 'WAND') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.prob = args[2];
        parsed.cost = args[3];
        parsed.mgc = args[4];
        parsed.dir = args[5];
        parsed.mtrl = args[6];
        parsed.color = args[7];
        parsed.class = 'WAND_CLASS';

        parsed.nmkn = 0;
        parsed.mrg = 0;
        parsed.uskn = 1;
        parsed.ctnr = 0;
        parsed.chrg = 1;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.big = 0;
        parsed.tuf = 0;
        parsed.sub = 'P_NONE';
        parsed.power = 0;
        parsed.delay = 0;
        parsed.wt = 7;
        parsed.sdam = 0;
        parsed.ldam = 0;
        parsed.oc1 = 0;
        parsed.oc2 = 0;
        parsed.nut = 30;
    } else if (macro === 'COIN') {
        parsed.name = args[0];
        parsed.desc = 'null';
        parsed.prob = args[1];
        parsed.mtrl = args[2];
        parsed.cost = args[3];
        parsed.class = 'COIN_CLASS';

        parsed.nmkn = 1;
        parsed.mrg = 1;
        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.mgc = 0;
        parsed.chrg = 0;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.big = 0;
        parsed.tuf = 0;
        parsed.dir = 0;
        parsed.sub = 'P_NONE';
        parsed.power = 0;
        parsed.delay = 0;
        parsed.wt = 1;
        parsed.sdam = 0;
        parsed.ldam = 0;
        parsed.oc1 = 0;
        parsed.oc2 = 0;
        parsed.nut = 0;
        parsed.color = 'HI_GOLD';
    } else if (macro === 'GEM') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.prob = args[2];
        parsed.wt = args[3];
        parsed.cost = args[4];
        parsed.nut = args[5];
        let mohs = args[6];
        let glass = args[7];
        parsed.color = args[8];
        parsed.class = 'GEM_CLASS';

        parsed.nmkn = 0;
        parsed.mrg = 1;
        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.mgc = 0;
        parsed.chrg = 0;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.big = 0;
        parsed.tuf = `HARDGEM(${mohs})`;
        parsed.dir = 0;
        parsed.sub = '-Const.P_SLING';
        parsed.mtrl = glass;
        parsed.power = 0;
        parsed.delay = 0;
        parsed.sdam = 3;
        parsed.ldam = 3;
        parsed.oc1 = 0;
        parsed.oc2 = 0;
    } else if (macro === 'ROCK') {
        parsed.name = args[0];
        parsed.desc = args[1];
        parsed.nmkn = args[2];
        parsed.prob = args[3];
        parsed.wt = args[4];
        parsed.cost = args[5];
        parsed.sdam = args[6];
        parsed.ldam = args[7];
        parsed.mgc = args[8];
        parsed.nut = args[9];
        let mohs = args[10];
        let glass = args[11];
        parsed.color = args[12];
        parsed.class = 'GEM_CLASS';

        parsed.mrg = 1;
        parsed.uskn = 0;
        parsed.ctnr = 0;
        parsed.chrg = 0;
        parsed.uniq = 0;
        parsed.nwsh = 0;
        parsed.big = 0;
        parsed.tuf = `HARDGEM(${mohs})`;
        parsed.dir = 0;
        parsed.sub = '-Const.P_SLING';
        parsed.mtrl = glass;
        parsed.power = 0;
        parsed.delay = 0;
        parsed.oc1 = 0;
        parsed.oc2 = 0;
    }

    parsedObjects.push(parsed);
}

// Generate the final JS string
let outJs = `// Auto-generated from C source — do not hand-edit\n\n`;
outJs += `import * as Const from './const.js';\n\n`;

// Add some necessary helper constants
outJs += `
function HARDGEM(mohs) {
    return mohs >= 8 ? 1 : 0;
}
`;

outJs += `\nexport const objects = [\n`;

for (let obj of parsedObjects) {
    outJs += `    {\n`;
    outJs += `        oc_name: ${obj.name},\n`;
    outJs += `        oc_descr: ${obj.desc},\n`;
    outJs += `        oc_name_known: ${obj.nmkn},\n`;
    outJs += `        oc_merge: ${obj.mrg},\n`;
    outJs += `        oc_uses_known: ${obj.uskn},\n`;
    outJs += `        oc_pre_discovered: 0,\n`;
    outJs += `        oc_magic: ${obj.mgc},\n`;
    outJs += `        oc_charged: ${obj.chrg},\n`;
    outJs += `        oc_unique: ${obj.uniq},\n`;
    outJs += `        oc_nowish: ${obj.nwsh},\n`;
    outJs += `        oc_big: ${obj.big},\n`;
    outJs += `        oc_tough: ${obj.tuf},\n`;

    let dir = obj.dir;

    if (obj.macro === 'WEAPON' || obj.macro === 'OBJECT') {
        if (dir === 'P') dir = 'Const.PIERCE';
        else if (dir === 'S') dir = 'Const.SLASH';
        else if (dir === 'B') dir = 'Const.WHACK';
        else if (dir === 'P|S') dir = 'Const.PIERCE | Const.SLASH';
        else if (dir === 'B|P') dir = 'Const.WHACK | Const.PIERCE';
        else if (dir === 'WHACK') dir = 'Const.WHACK';
    }

    if (typeof dir === 'string' && dir.match(/^[A-Z_]+$/) && !dir.startsWith('HARDGEM') && !dir.startsWith('Const.')) dir = `Const.${dir}`;

    outJs += `        oc_dir: ${dir},\n`;

    let mtrl = obj.mtrl;
    if (typeof mtrl === 'string' && mtrl.match(/^[A-Z_]+$/) && !mtrl.startsWith('HARDGEM') && mtrl !== 'P_NONE') mtrl = `Const.${mtrl}`;
    outJs += `        oc_material: ${mtrl},\n`;

    let sub = obj.sub;
    if (typeof sub === 'string' && sub.match(/^[A-Z_]+$/) && sub !== 'P_NONE' && !sub.startsWith('Const.')) {
        sub = `Const.${sub}`;
    } else if (typeof sub === 'string' && sub.startsWith('-') && !sub.startsWith('-Const.')) {
        sub = `-Const.${sub.substring(1)}`;
    } else if (typeof sub === 'string' && sub === 'P_NONE') {
        sub = `0`;
    }
    outJs += `        oc_subtyp: ${sub},\n`;

    let power = obj.power;
    if (typeof power === 'string' && power.match(/^[A-Z_]+$/) && power !== '0') power = `Const.${power}`;
    outJs += `        oc_oprop: ${power},\n`;

    let cls = obj.class;
    if (typeof cls === 'string' && cls.match(/^[A-Z_]+$/)) cls = `Const.${cls}`;
    outJs += `        oc_class: ${cls},\n`;

    outJs += `        oc_prob: ${obj.prob},\n`;
    outJs += `        oc_delay: ${obj.delay},\n`;

    let wt = obj.wt;
    if (typeof wt === 'string' && wt.match(/^[A-Z_]+$/)) wt = `Const.${wt}`;
    outJs += `        oc_weight: ${wt},\n`;

    outJs += `        oc_cost: ${obj.cost},\n`;
    outJs += `        oc_wsdam: ${obj.sdam},\n`;
    outJs += `        oc_wldam: ${obj.ldam},\n`;
    outJs += `        oc_oc1: ${obj.oc1},\n`;
    outJs += `        oc_oc2: ${obj.oc2},\n`;
    outJs += `        oc_nutrition: ${obj.nut},\n`;

    let col = obj.color;
    if (typeof col === 'string' && col.match(/^[A-Z_]+$/)) col = `Const.${col}`;
    outJs += `        oc_color: ${col},\n`;

    outJs += `    },\n`;
}

outJs += `];\n\n`;

// Also generate the constants mapping
for (let i = 0; i < parsedObjects.length; i++) {
    const obj = parsedObjects[i];
    if (obj.sn) {
        outJs += `export const ${obj.sn} = ${i};\n`;
    }
}
outJs += `export const NUM_OBJECTS = ${parsedObjects.length};\n`;

fs.writeFileSync('js/objects.js', outJs);
console.log('Successfully wrote js/objects.js');
