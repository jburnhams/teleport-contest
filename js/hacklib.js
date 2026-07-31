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


// Stubs for goodpos utilities that don't consume RNG
export function is_pool(x, y) { return false; }
export function is_waterwall(x, y) { return false; }
export function is_swimmer(mdat) { return false; }
export function m_in_air(mtmp) { return false; }
export function likes_lava(mdat) { return false; }
export function passes_walls(mdat) { return false; }
export function may_passwall(x, y) { return false; }
export function amorphous(mdat) { return false; }
export function closed_door(x, y) { return false; }
export function onscary(x, y, mtmp) { return false; }
export function throws_rocks(mdat) { return false; }
export function is_exclusion_zone(zone_type, x, y) { return false; }
export function sobj_at(otyp, x, y) { return null; }
export function sengr_at(text, x, y, exact) { return null; }
export function accessible(x, y) {
    // basic accessibility check, simplified
    return true;
}
export function is_lava(x, y) { return false; }
