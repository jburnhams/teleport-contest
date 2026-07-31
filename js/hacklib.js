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

// =====================================================================
// Terrain Helpers
// =====================================================================
import {
    POOL, MOAT, WATER, DRAWBRIDGE_UP, LAVAPOOL, LAVAWALL, ICE,
    DB_UNDER, DB_LAVA, DB_ICE, DB_MOAT, IS_DOOR
} from './const.js';

export function is_moat(x, y) {
    if (!isok(x, y)) return false;
    const ltyp = game.level.locations[x][y].typ;
    if (!game.u?.uz?.dnum) return false;

    if (ltyp === MOAT || (ltyp === DRAWBRIDGE_UP && (game.level.locations[x][y].drawbridgemask & DB_UNDER) === DB_MOAT)) {
        return true;
    }
    return false;
}

export function is_pool(x, y) {
    if (!isok(x, y)) return false;
    const ltyp = game.level.locations[x][y].typ;
    if (ltyp === POOL || ltyp === MOAT || ltyp === WATER || is_moat(x, y)) {
        return true;
    }
    return false;
}

export function is_lava(x, y) {
    if (!isok(x, y)) return false;
    const ltyp = game.level.locations[x][y].typ;
    if (ltyp === LAVAPOOL || ltyp === LAVAWALL ||
        (ltyp === DRAWBRIDGE_UP && (game.level.locations[x][y].drawbridgemask & DB_UNDER) === DB_LAVA)) {
        return true;
    }
    return false;
}

export function is_ice(x, y) {
    if (!isok(x, y)) return false;
    const ltyp = game.level.locations[x][y].typ;
    if (ltyp === ICE ||
        (ltyp === DRAWBRIDGE_UP && (game.level.locations[x][y].drawbridgemask & DB_UNDER) === DB_ICE)) {
        return true;
    }
    return false;
}

export function closed_door(x, y) {
    if (!isok(x, y)) return false;
    const lev = game.level.locations[x][y];
    return IS_DOOR(lev.typ) && (lev.doormask & (1 | 2)) !== 0;
}

export function may_passwall(x, y) {
    if (!isok(x, y)) return false;
    return true;
}

export function ACCESSIBLE(typ) {
    return typ >= 23; // DOOR
}

export function accessible(x, y) {
    if (!isok(x, y)) return false;
    return ACCESSIBLE(game.level.locations[x][y].typ);
}

export function sobj_at(otyp, x, y) {
    if (!isok(x, y)) return null;
    let obj = game.level.objects[x][y];
    while (obj) {
        if (obj.otyp === otyp) return obj;
        obj = obj.nexthere;
    }
    return null;
}

export function sengr_at(text, x, y, exact) {
    return false;
}

export function is_exclusion_zone(type, x, y) {
    return false;
}

export function onscary(x, y, mtmp) {
    return false;
}

export function is_rider(ptr) {
    return false;
}

export function unique_corpstat(ptr) {
    return false;
}

export function haseyes(ptr) {
    return (ptr.mflags1 & 0x00001000) === 0;
}

export function throws_rocks(ptr) {
    return (ptr.mflags2 & 0x08000000) !== 0;
}

export function ZAP_POS(typ) { return typ >= 16; } // POOL = 16
