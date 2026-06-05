// hacklib.js — Utility functions.
// C ref: hacklib.c, dungeon.c helpers

import { game } from './gstate.js';

export function isok(x, y) {
    const { COLNO, ROWNO } = await_const();
    return x >= 1 && x <= COLNO - 1 && y >= 0 && y <= ROWNO - 1;
}

// Lazy import to avoid circular deps
let _const = null;
function await_const() {
    if (!_const) _const = { COLNO: 80, ROWNO: 21 };
    return _const;
}

export function distmin(x1, y1, x2, y2) {
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

export function dist2(x1, y1, x2, y2) {
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
}

export function depth(uz) {
    const dnum = uz?.dnum ?? 0;
    const dlevel = uz?.dlevel ?? 1;
    const dungeon = game?.dungeons?.[dnum];
    if (!dungeon) return dlevel;
    return (dungeon.depth_start || 1) + dlevel - 1;
}

export function Inhell(uz) {
    const lev = uz ?? game?.u?.uz;
    return !!lev && !!game?.dungeons?.[lev.dnum]?.flags?.hellish;
}

export function level_difficulty() {
    let res;

    // TODO: if (In_endgame(&u.uz)) { ... }
    // TODO: else if (u.uhave.amulet) { ... }
    res = depth(game.u?.uz);

    // If it builds up, adjust
    // TODO: if (builds_up(&u.uz)) res += 2 * (game.dungeons[u.uz.dnum].entry_lev - u.uz.dlevel + 1);

    return res;
}

// C ref: rn2(x) already in rng.js — re-export not needed

import * as C from './const.js';

export function is_waterwall(x, y) {
    if (isok(x, y) && C.IS_WATERWALL(game.level.locations[x][y].typ))
        return true;
    return false;
}

export function is_pool(x, y) {
    if (!isok(x, y)) return false;
    let ltyp = game.level.locations[x][y].typ;
    if (ltyp === C.POOL || ltyp === C.MOAT || ltyp === C.WATER || is_moat(x, y))
        return true;
    return false;
}

export function is_lava(x, y) {
    if (!isok(x, y)) return false;
    let ltyp = game.level.locations[x][y].typ;
    if (ltyp === C.LAVAPOOL || ltyp === C.LAVAWALL
        || (ltyp === C.DRAWBRIDGE_UP
            && (game.level.locations[x][y].drawbridgemask & C.DB_UNDER) === C.DB_LAVA))
        return true;
    return false;
}

export function is_pool_or_lava(x, y) {
    return is_pool(x, y) || is_lava(x, y);
}

export function is_ice(x, y) {
    if (!isok(x, y)) return false;
    let ltyp = game.level.locations[x][y].typ;
    if (ltyp === C.ICE || (ltyp === C.DRAWBRIDGE_UP
                        && (game.level.locations[x][y].drawbridgemask & C.DB_UNDER) === C.DB_ICE))
        return true;
    return false;
}

export function is_moat(x, y) {
    if (!isok(x, y)) return false;
    let ltyp = game.level.locations[x][y].typ;
    if (!Is_juiblex_level()
        && (ltyp === C.MOAT
            || (ltyp === C.DRAWBRIDGE_UP
                && (game.level.locations[x][y].drawbridgemask & C.DB_UNDER) === C.DB_MOAT)))
        return true;
    return false;
}

export function Is_juiblex_level(uz) {
    // TODO: implement Juiblex level check if needed
    return false;
}

export function may_passwall(x, y) {
    return isok(x, y) && !C.IS_ROCK(game.level.locations[x][y].typ) && !C.closed_door(x, y);
}

export function closed_door(x, y) {
    return isok(x, y) && game.level.locations[x][y].typ === C.DOOR && (game.level.locations[x][y].doormask & C.D_CLOSED) !== 0;
}

export function accessible(x, y) {
    return isok(x, y) && C.ACCESSIBLE(game.level.locations[x][y].typ);
}

export function is_exclusion_zone(reason, x, y) {
    // For now, simplify and assume no exclusion zones, this is used in makemon logic but rarely triggered
    return false;
}

export function m_in_air(mtmp) {
    return false; // Stubs to not disrupt goodpos but won't cause PRNG desyncs if they return false as they don't consume RNG.
}

export function likes_lava(ptr) {
    return false; // Stub. Proper likes_lava implementation will go to mondata in a separate step if required.
}

export function sobj_at(otyp, x, y) {
    // check if an object of 'otyp' is at 'x,y'
    let obj = game.level.objects[x][y];
    while (obj) {
        if (obj.otyp === otyp) return obj;
        obj = obj.nexthere;
    }
    return null;
}

export function sengr_at(str, x, y, exact) {
    // Check if engraving matches
    return false;
}
