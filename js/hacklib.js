import * as C from "./const.js";
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

import { rn1, rn2, rnd } from './rng.js';

export function collect_coords(ccc, cx, cy, maxradius, cc_flags, filter_fn) {
    let x, y, lox, hix, loy, hiy;
    let radius, rowrange, colrange, k, n = 0;
    let passcc_idx = 0;
    let newpass, passend;
    let include_cxcy = (cc_flags & C.CC_INCL_CENTER) !== 0;
    let scramble = (cc_flags & C.CC_UNSHUFFLED) === 0;
    let ring_pairs = scramble && ((cc_flags & C.CC_RING_PAIRS) !== 0);
    let skip_mons = (cc_flags & C.CC_SKIP_MONS) !== 0;
    let skip_inaccessible = (cc_flags & C.CC_SKIP_INACCS) !== 0;
    let result = 0;

    rowrange = (cy < C.ROWNO / 2) ? (C.ROWNO - 1 - cy) : cy;
    colrange = (cx < C.COLNO / 2) ? (C.COLNO - 1 - cx) : cx;
    k = Math.max(rowrange, colrange);

    if (!maxradius) maxradius = k;
    else maxradius = Math.min(maxradius, k);

    for (radius = include_cxcy ? 0 : 1; radius <= maxradius; ++radius) {
        if (!ring_pairs) {
            newpass = true;
            passend = true;
        } else {
            newpass = ((radius % 2) !== 0 || radius === 0);
            passend = ((radius % 2) === 0 || radius === maxradius);
        }

        if (newpass || passcc_idx === -1) {
            passcc_idx = result; // index in the array
            n = 0;
        }

        lox = cx - radius; hix = cx + radius;
        loy = cy - radius; hiy = cy + radius;

        for (y = Math.max(loy, 0); y <= hiy; ++y) {
            if (y > C.ROWNO - 1) break;
            for (x = Math.max(lox, 1); x <= hix; ++x) {
                if (x > C.COLNO - 1) break;
                if (x !== lox && x !== hix && y !== loy && y !== hiy) continue;
                if ((skip_mons && game.level.monsters[x] && game.level.monsters[x][y]) ||
                    (skip_inaccessible && !ZAP_POS(game.level.locations[x][y].typ))) {
                    continue;
                }
                if (filter_fn && !filter_fn(x, y)) continue;

                ccc.push({ x: x, y: y });
                ++n;
                ++result;
            }
        }

        if (scramble && passend) {
            while (n > 1) {
                k = rn2(n);
                if (k) {
                    let temp = ccc[passcc_idx + 0];
                    ccc[passcc_idx + 0] = ccc[passcc_idx + k];
                    ccc[passcc_idx + k] = temp;
                }
                ++passcc_idx;
                --n;
            }
            passcc_idx = -1; // reset condition
        }
    }
    return result;
}

export function ZAP_POS(typ) {
    return typ >= C.POOL;
}

export function u_at(x, y) {
    return game.u.ux === x && game.u.uy === y;
}

export function MON_AT(x, y) {
    return game.level.monsters[x] && game.level.monsters[x][y] !== null && game.level.monsters[x][y] !== undefined;
}

export function sengr_at(str, x, y, check_blind) {
    // not implemented yet
    return null;
}

export function vobj_at(x, y) {
    // not implemented yet
    return null;
}

export function is_exclusion_zone(zone, x, y) {
    // not implemented yet
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
    if (ltyp === C.LAVAPOOL || ltyp === C.LAVAWALL || (ltyp === C.DRAWBRIDGE_UP && (game.level.locations[x][y].drawbridgemask & C.DB_UNDER) === C.DB_LAVA))
        return true;
    return false;
}

export function is_waterwall(x, y) {
    if (isok(x, y) && game.level.locations[x][y].typ === C.WATER) // IS_WATERWALL approximated, map layout handles this usually
        return true;
    return false;
}

export function is_moat(x, y) {
    if (!isok(x, y)) return false;
    let ltyp = game.level.locations[x][y].typ;
    if (!C.Is_juiblex_level() && (ltyp === C.MOAT || (ltyp === C.DRAWBRIDGE_UP && (game.level.locations[x][y].drawbridgemask & C.DB_UNDER) === C.DB_MOAT)))
        return true;
    return false;
}

export function Swimming() { return false; }
export function Amphibious() { return false; }
export function Levitation() { return false; }
export function Flying() { return false; }
export function Wwalking() { return false; }
export function Fire_resistance() { return false; }
export function Upolyd() { return false; }
export function m_in_air(mtmp) { return false; }
export function closed_door(x, y) { return false; }
export function may_passwall(x, y) { return false; }
export function accessible(x, y) { return true; } // Need proper impl
export function onscary(x, y, mtmp) { return false; }
export function sobj_at(otyp, x, y) { return null; }

export function is_ndemon(ptr) {
    return mondata.is_demon(ptr) && ptr !== mons[C.PM_MAIL_DAEMON];
}
export function is_domestic(ptr) {
    return (ptr.mflags1 & C.M1_DOMESTIC) !== 0;
}
export function is_armed(ptr) {
    return ptr === mons[C.PM_ORC_CAPTAIN] || ptr === mons[C.PM_CENTAUR] || mondata.is_elf(ptr) || mondata.is_mercenary(ptr); // Approximated for tests
}
export function can_saddle(mtmp) {
    return false;
}
export function which_armor(mtmp, W_SADDLE) {
    return null;
}
export function In_sokoban() {
    return false;
}
export function cansee(x, y) {
    return false;
}
