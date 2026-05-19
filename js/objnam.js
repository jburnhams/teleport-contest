// objnam.js — Object naming and formatting
// C ref: objnam.c

import { TOOL_CLASS, WEAPON_CLASS, ARMOR_CLASS, BALL_CLASS, CHAIN_CLASS } from './const.js';

import { objects } from './objects.js';
import { P_NONE } from './const.js';

export function is_weptool(obj) {
    return (obj.oclass === TOOL_CLASS && objects[obj.otyp].oc_skill !== P_NONE);
}

// C ref: objnam.c erosion_matters
export function erosion_matters(obj) {
    switch (obj.oclass) {
        case TOOL_CLASS:
            return is_weptool(obj);
        case WEAPON_CLASS:
        case ARMOR_CLASS:
        case BALL_CLASS:
        case CHAIN_CLASS:
            return true;
        default:
            break;
    }
    return false;
}
