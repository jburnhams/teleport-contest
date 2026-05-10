import fs from 'fs';

const text = fs.readFileSync('nethack-c/upstream/include/monsters.h', 'utf8');
const lines = text.split('\n');

let pmIndex = 0;
let output = `// Auto-generated from C source — do not hand-edit\n\n`;
output += `import * as C from './const.js';\n\n`;
output += `export const mons = [\n`;

let pmIndices = [];
let currentMonster = "";
let inMonster = false;
let parenCount = 0;

for (let line of lines) {
    if (!inMonster && line.match(/^\s*MON\(/)) {
        inMonster = true;
        currentMonster = line;
        parenCount += (line.match(/\(/g) || []).length;
        parenCount -= (line.match(/\)/g) || []).length;
    } else if (inMonster) {
        currentMonster += " " + line.trim();
        parenCount += (line.match(/\(/g) || []).length;
        parenCount -= (line.match(/\)/g) || []).length;
    }

    if (inMonster && parenCount === 0) {
        let inner = currentMonster.replace(/^\s*MON\s*\(/, '').replace(/\)\s*,?\s*$/, '');

        let mname = '';
        let namMatch = inner.match(/NAM\s*\(\s*"([^"]+)"\s*\)/);
        if (namMatch) {
            mname = namMatch[1];
        } else {
            let strMatch = inner.match(/"([^"]+)"/);
            if (strMatch) mname = strMatch[1];
        }

        let args = [];
        let currentArg = '';
        let pCount = 0;

        for (let i = 0; i < inner.length; i++) {
            let char = inner[i];
            if (char === '(') pCount++;
            else if (char === ')') pCount--;

            if (char === ',' && pCount === 0) {
                args.push(currentArg.trim());
                currentArg = '';
            } else {
                currentArg += char;
            }
        }
        args.push(currentArg.trim());

        if (args.length === 14) {
            let [nam, sym, lvl, gen, atk, siz, mr1, mr2, flg1, flg2, flg3, d, col, bn] = args;

            let lvlArgs = lvl.match(/LVL\s*\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
            let mlevel = lvlArgs ? lvlArgs[1].trim() : "0";
            let mmove = lvlArgs ? lvlArgs[2].trim() : "0";
            let ac = lvlArgs ? lvlArgs[3].trim() : "0";
            let mr = lvlArgs ? lvlArgs[4].trim() : "0";
            let maligntyp = lvlArgs ? lvlArgs[5].trim() : "0";
            if (maligntyp === 'A_NONE') maligntyp = 'C.A_NONE';
            else if (maligntyp.startsWith('A_')) maligntyp = 'C.' + maligntyp;

            let sizArgs = siz.match(/SIZ\s*\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
            let cwt = sizArgs ? sizArgs[1].trim() : "0";
            if (cwt.startsWith('WT_')) cwt = 'C.' + cwt;
            let cnutrit = sizArgs ? sizArgs[2].trim() : "0";
            let msound = sizArgs ? sizArgs[3].trim() : "0";
            let msize = sizArgs ? sizArgs[4].trim() : "0";

            let atkMatch = atk.match(/A\s*\((.*)\)/);
            let mattkStr = "[]";
            if (atkMatch) {
                let innerAtk = atkMatch[1];
                let aArgs = [];
                let aArg = '';
                let aPCount = 0;
                for (let i = 0; i < innerAtk.length; i++) {
                    let char = innerAtk[i];
                    if (char === '(') aPCount++;
                    else if (char === ')') aPCount--;
                    if (char === ',' && aPCount === 0) {
                        aArgs.push(aArg.trim());
                        aArg = '';
                    } else {
                        aArg += char;
                    }
                }
                aArgs.push(aArg.trim());

                let parsedAtks = aArgs.map(a => {
                    if (a === 'NO_ATTK') return `{ at: 0, ad: 0, damn: 0, damd: 0 }`;
                    let match = a.match(/ATTK\s*\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
                    if (match) {
                        let at = match[1].trim();
                        if (at === '0') at = 'C.AT_NONE';
                        else if (!at.startsWith('C.')) at = 'C.' + at;

                        let ad = match[2].trim();
                        if (ad === '0') ad = 'C.AD_PHYS';
                        else if (!ad.startsWith('C.')) ad = 'C.' + ad;

                        return `{ at: ${at}, ad: ${ad}, damn: ${match[3].trim()}, damd: ${match[4].trim()} }`;
                    }
                    return `{ at: 0, ad: 0, damn: 0, damd: 0 }`;
                });
                mattkStr = `[\n            ${parsedAtks.join(',\n            ')}\n        ]`;
            }

            let cleanGen = gen.replace(/G_[A-Z0-9_]+/g, match => 'C.' + match);
            let cleanMr1 = mr1.replace(/MR_[A-Z0-9_]+/g, match => 'C.' + match);
            let cleanMr2 = mr2.replace(/MR_[A-Z0-9_]+/g, match => 'C.' + match);
            let cleanFlg1 = flg1.replace(/M1_[A-Z0-9_]+/g, match => 'C.' + match);
            cleanFlg1 = cleanFlg1.replace(/0L/g, '0');
            let cleanFlg2 = flg2.replace(/M2_[A-Z0-9_]+/g, match => 'C.' + match);
            let cleanFlg3 = flg3.replace(/M3_[A-Z0-9_]+/g, match => 'C.' + match);

            let cleanCol = col.replace(/CLR_[A-Z0-9_]+/g, match => 'C.' + match);
            cleanCol = cleanCol.replace(/HI_[A-Z0-9_]+/g, match => 'C.' + match);
            cleanCol = cleanCol.replace(/DRAGON_SILVER/g, 'C.DRAGON_SILVER');

            let cleanSym = sym.replace(/S_[A-Z0-9_]+/g, match => 'C.' + match);
            let cleanSound = msound.replace(/MS_[A-Z0-9_]+/g, match => 'C.' + match);
            let cleanSize = msize.replace(/MZ_[A-Z0-9_]+/g, match => 'C.' + match);

            output += `    {\n`;
            output += `        mname: "${mname}",\n`;
            output += `        mlet: ${cleanSym},\n`;
            output += `        mlevel: ${mlevel}, mmove: ${mmove}, ac: ${ac}, mr: ${mr}, maligntyp: ${maligntyp},\n`;
            output += `        geno: ${cleanGen},\n`;
            output += `        mattk: ${mattkStr},\n`;
            output += `        cwt: ${cwt}, cnutrit: ${cnutrit}, msound: ${cleanSound}, msize: ${cleanSize},\n`;
            output += `        mresists: ${cleanMr1}, mconveys: ${cleanMr2},\n`;
            output += `        mflags1: ${cleanFlg1},\n`;
            output += `        mflags2: ${cleanFlg2},\n`;
            output += `        mflags3: ${cleanFlg3},\n`;
            output += `        difficulty: ${d},\n`;
            output += `        mcolor: ${cleanCol}\n`;
            output += `    },\n`;

            pmIndices.push(`export const PM_${bn} = ${pmIndex};`);
            pmIndex++;
        }

        inMonster = false;
    }
}

output += `    {\n`;
output += `        mname: "",\n`;
output += `        mlet: 0,\n`;
output += `        mlevel: 0, mmove: 0, ac: 0, mr: 0, maligntyp: 0,\n`;
output += `        geno: C.G_NOGEN | C.G_NOCORPSE,\n`;
output += `        mattk: [\n            { at: 0, ad: 0, damn: 0, damd: 0 },\n            { at: 0, ad: 0, damn: 0, damd: 0 },\n            { at: 0, ad: 0, damn: 0, damd: 0 },\n            { at: 0, ad: 0, damn: 0, damd: 0 },\n            { at: 0, ad: 0, damn: 0, damd: 0 },\n            { at: 0, ad: 0, damn: 0, damd: 0 }\n        ],\n`;
output += `        cwt: 0, cnutrit: 0, msound: 0, msize: 0,\n`;
output += `        mresists: 0, mconveys: 0,\n`;
output += `        mflags1: 0,\n`;
output += `        mflags2: C.M2_NOPOLY,\n`;
output += `        mflags3: 0,\n`;
output += `        difficulty: 0,\n`;
output += `        mcolor: 0\n`;
output += `    }\n`;

output += `];\n\n`;

output += `export const NUMMONS = ${pmIndex};\n\n`;
output += pmIndices.join('\n') + '\n';

fs.writeFileSync('js/monst.js', output);
