import fs from 'fs';

let content = fs.readFileSync('js/u_init.js', 'utf8');
content = content.replace("otyp === 323 || // WAN_WISHING", "otyp === WAN_WISHING || // WAN_WISHING");
content = content.replace("otyp === 309 || // RIN_LEVITATION", "otyp === RIN_LEVITATION || // RIN_LEVITATION");
content = content.replace("otyp === 231 || // POT_HALLUCINATION", "otyp === POT_HALLUCINATION || // POT_HALLUCINATION");
content = content.replace("otyp === 252 || // POT_ACID", "otyp === POT_ACID || // POT_ACID");
content = content.replace("otyp === 289 || // SCR_AMNESIA", "otyp === SCR_AMNESIA || // SCR_AMNESIA");
content = content.replace("otyp === 280 || // SCR_FIRE", "otyp === SCR_FIRE || // SCR_FIRE");
content = content.replace("otyp === 297 || // SCR_BLANK_PAPER", "otyp === SCR_BLANK_PAPER || // SCR_BLANK_PAPER");
content = content.replace("otyp === 341 || // SPE_BLANK_PAPER", "otyp === SPE_BLANK_PAPER || // SPE_BLANK_PAPER");
content = content.replace("otyp === 302 || // RIN_AGGRAVATE_MONSTER", "otyp === RIN_AGGRAVATE_MONSTER || // RIN_AGGRAVATE_MONSTER");
content = content.replace("otyp === 303 || // RIN_HUNGER", "otyp === RIN_HUNGER || // RIN_HUNGER");
content = content.replace("otyp === 322 || // WAN_NOTHING", "otyp === WAN_NOTHING || // WAN_NOTHING");
content = content.replace("obj = mksobj(364, true, false); // PANCAKE", "obj = mksobj(PANCAKE, true, false); // PANCAKE");
content = content.replace("obj.oclass === 10", "obj.oclass === SPBOOK_CLASS");

const constants = "WAN_WISHING, RIN_LEVITATION, POT_HALLUCINATION, POT_ACID, SCR_AMNESIA, SCR_FIRE, SCR_BLANK_PAPER, SPE_BLANK_PAPER, RIN_AGGRAVATE_MONSTER, RIN_HUNGER, WAN_NOTHING, PANCAKE, SPBOOK_CLASS";
content = content.replace("import { objects } from './objects.js';", `import { objects, WAN_WISHING, RIN_LEVITATION, POT_HALLUCINATION, POT_ACID, SCR_AMNESIA, SCR_FIRE, SCR_BLANK_PAPER, SPE_BLANK_PAPER, RIN_AGGRAVATE_MONSTER, RIN_HUNGER, WAN_NOTHING, PANCAKE } from './objects.js';\nimport { SPBOOK_CLASS } from './const.js';`);

fs.writeFileSync('js/u_init.js', content, 'utf8');
