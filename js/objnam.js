import * as Const from './const.js';
import { objects } from './objects.js';

// C ref: objnam.c

export function is_weptool(obj) {
    return (obj.oclass === Const.TOOL_CLASS && objects[obj.otyp].oc_skill !== Const.P_NONE);
}

export function erosion_matters(obj) {
    switch (obj.oclass) {
        case Const.TOOL_CLASS:
            /* it's possible for a rusty weptool to be polymorphed into some
               non-weptool iron tool, in which case the rust implicitly goes
               away, but it's also possible for it to be polymorphed into a
               non-iron tool, in which case rust also implicitly goes away,
               so there's no particular reason to try to handle the first
               instance differently [this comment belongs in poly_obj()...] */
            return is_weptool(obj) ? 1 : 0;
        case Const.WEAPON_CLASS:
        case Const.ARMOR_CLASS:
        case Const.BALL_CLASS:
        case Const.CHAIN_CLASS:
            return 1;
        default:
            break;
    }
    return 0;
}
