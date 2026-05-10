import fs from 'fs';

let uInit = fs.readFileSync('js/u_init.js', 'utf8');

const filterFunc = `
export function ini_inv_mkobj_filter(oclass, got_level1_spellbook) {
    let obj = mkobj(oclass, false);
    let otyp = obj.otyp;
    let trycnt = 0;

    // Simplistic stub just recreating the same C loop structure
    // Since gn.nocreate etc aren't fully implemented in our JS, we'll just check the base case.
    while (
        otyp === 323 || // WAN_WISHING
        otyp === 309 || // RIN_LEVITATION
        otyp === 231 || // POT_HALLUCINATION
        otyp === 252 || // POT_ACID
        otyp === 289 || // SCR_AMNESIA
        otyp === 280 || // SCR_FIRE
        otyp === 297 || // SCR_BLANK_PAPER
        otyp === 341 || // SPE_BLANK_PAPER
        otyp === 302 || // RIN_AGGRAVATE_MONSTER
        otyp === 303 || // RIN_HUNGER
        otyp === 322 || // WAN_NOTHING
        (obj.oclass === 10 && objects[otyp].oc_level > (got_level1_spellbook ? 3 : 1)) // SPBOOK_CLASS
    ) {
        if (++trycnt > 1000) {
            obj = mksobj(364, true, false); // PANCAKE
            break;
        }
        obj = mkobj(oclass, false);
        otyp = obj.otyp;
    }
    return obj;
}
`;

uInit = uInit.replace(/export function ini_inv_mkobj_filter[\s\S]*?\}\n/, filterFunc);
uInit = uInit.replace("import { mksobj, mkobj } from './mkobj.js';", "import { mksobj, mkobj } from './mkobj.js';\nimport { objects } from './objects.js';");
fs.writeFileSync('js/u_init.js', uInit, 'utf8');
