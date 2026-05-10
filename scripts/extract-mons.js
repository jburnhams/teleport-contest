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
    if (!inMonster && (line.match(/^\s*MON\(/) || line.match(/^\s*MON3\(/))) {
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
        let inner = currentMonster.replace(/^\s*MON3?\s*\(/, '').replace(/\)\s*,?\s*$/, '');

        let mname = '';
        let namMatch = inner.match(/NAM\s*\(\s*"([^"]+)"\s*\)/);
        let namsMatch = inner.match(/NAMS\s*\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)/);

        if (namMatch) {
            mname = namMatch[1];
        } else if (namsMatch) {
            mname = namsMatch[1];
        } else {
            let strMatch = inner.match(/"([^"]+)"/);
            if (strMatch) mname = strMatch[1];
        }

        let args = [];
        let currentArg = '';
        let pCount = 0;
        let inQuotes = false;

        for (let i = 0; i < inner.length; i++) {
            let char = inner[i];
            if (char === '"' && inner[i-1] !== '\\') inQuotes = !inQuotes;
            if (!inQuotes) {
                if (char === '(') pCount++;
                else if (char === ')') pCount--;
            }

            if (char === ',' && pCount === 0 && !inQuotes) {
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
            else if (maligntyp.match(/^[A-Za-z_][A-Za-z0-9_]*$/) && !maligntyp.match(/^[0-9]+$/)) maligntyp = 'C.' + maligntyp;

            let sizArgs = siz.match(/SIZ\s*\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
            let cwt = sizArgs ? sizArgs[1].trim() : "0";
            if (cwt.match(/^[A-Za-z_][A-Za-z0-9_]*$/) && !cwt.match(/^[0-9]+$/)) cwt = 'C.' + cwt;
            let cnutrit = sizArgs ? sizArgs[2].trim() : "0";
            if (cnutrit.match(/^[A-Za-z_][A-Za-z0-9_]*$/) && !cnutrit.match(/^[0-9]+$/)) cnutrit = 'C.' + cnutrit;
            let msound = sizArgs ? sizArgs[3].trim() : "0";
            let msize = sizArgs ? sizArgs[4].trim() : "0";

            let mattkStr = "[\n            { at: 0, ad: 0, damn: 0, damd: 0 },\n            { at: 0, ad: 0, damn: 0, damd: 0 },\n            { at: 0, ad: 0, damn: 0, damd: 0 },\n            { at: 0, ad: 0, damn: 0, damd: 0 },\n            { at: 0, ad: 0, damn: 0, damd: 0 },\n            { at: 0, ad: 0, damn: 0, damd: 0 }\n        ]";

            let isSuccubus = atk.includes('SEDUCTION_ATTACKS_YES') || atk.includes('SEDUCTION_ATTACKS_NO');
            if (isSuccubus) {
                let attacks = [];
                if (atk.includes('SEDUCTION_ATTACKS_YES')) {
                    attacks.push(`{ at: C.AT_BITE, ad: C.AD_SSEX, damn: 0, damd: 0 }`);
                    attacks.push(`{ at: C.AT_CLAW, ad: C.AD_PHYS, damn: 1, damd: 3 }`);
                    attacks.push(`{ at: C.AT_CLAW, ad: C.AD_PHYS, damn: 1, damd: 3 }`);
                } else {
                    attacks.push(`{ at: C.AT_CLAW, ad: C.AD_PHYS, damn: 1, damd: 3 }`);
                    attacks.push(`{ at: C.AT_CLAW, ad: C.AD_PHYS, damn: 1, damd: 3 }`);
                    attacks.push(`{ at: C.AT_BITE, ad: C.AD_DRLI, damn: 2, damd: 6 }`);
                }
                while(attacks.length < 6) attacks.push(`{ at: 0, ad: 0, damn: 0, damd: 0 }`);
                mattkStr = `[\n            ${attacks.join(',\n            ')}\n        ]`;
            } else {
                let atkMatch = atk.match(/A\s*\((.*)\)/);
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
                            if (at.match(/^[A-Za-z_][A-Za-z0-9_]*$/) && !at.match(/^[0-9]+$/)) {
                                if (at !== 'NO_ATTK') at = 'C.' + at;
                                else at = '0';
                            }

                            let ad = match[2].trim();
                            if (ad.match(/^[A-Za-z_][A-Za-z0-9_]*$/) && !ad.match(/^[0-9]+$/)) {
                                ad = 'C.' + ad;
                            }

                            return `{ at: ${at}, ad: ${ad}, damn: ${match[3].trim()}, damd: ${match[4].trim()} }`;
                        }
                        return `{ at: 0, ad: 0, damn: 0, damd: 0 }`;
                    });

                    while(parsedAtks.length < 6) parsedAtks.push(`{ at: 0, ad: 0, damn: 0, damd: 0 }`);
                    mattkStr = `[\n            ${parsedAtks.slice(0, 6).join(',\n            ')}\n        ]`;
                }
            }

            function cleanBitmask(str) {
                // remove 0L, L, replace tokens
                str = str.replace(/0L/g, '0');
                str = str.replace(/([0-9]+)L/g, '$1');
                str = str.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, match => {
                    return 'C.' + match;
                });
                return str;
            }

            let cleanGen = cleanBitmask(gen);
            let cleanMr1 = cleanBitmask(mr1);
            let cleanMr2 = cleanBitmask(mr2);
            let cleanFlg1 = cleanBitmask(flg1);
            let cleanFlg2 = cleanBitmask(flg2);
            let cleanFlg3 = cleanBitmask(flg3);

            let cleanCol = cleanBitmask(col);
            let cleanSym = cleanBitmask(sym);
            let cleanSound = cleanBitmask(msound);
            let cleanSize = cleanBitmask(msize);

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
