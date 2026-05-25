import { BOULDER } from './objects.js';
import { game } from './gstate.js';
import { M_AP_NOTHING, MSLOW, MON_FLOOR, MON_OFFMAP, MON_DETACH, MON_MIGRATING } from './const.js';
import { next_ident } from './mkobj.js';
import { isok } from './hacklib.js';

export function DEADMONSTER(mon) {
    return mon.mhp < 1;
}

export function newmonst() {
    let mon = {

        nmon: null,
        data: null,
        m_id: 0,
        mnum: 0,
        cham: 0,
        movement: 0,
        m_lev: 0,
        malign: 0,
        mx: 0,
        my: 0,
        mux: 0,
        muy: 0,
        mtrack: [{x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}],
        mhp: 0,
        mhpmax: 0,
        mappearance: 0,
        m_ap_type: M_AP_NOTHING,
        mtame: 0,
        mintrinsics: 0,
        mextrinsics: 0,
        seen_resistance: 0,
        mspec_used: 0,
        female: 0,
        minvis: 0,
        invis_blkd: 0,
        perminvis: 0,
        mcan: 0,
        mburied: 0,
        mundetected: 0,
        mcansee: 0,
        mspeed: 0,
        permspeed: 0,
        mrevived: 0,
        mcloned: 0,
        mavenge: 0,
        mflee: 0,
        mfleetim: 0,
        msleeping: 0,
        mblinded: 0,
        mstun: 0,
        mfrozen: 0,
        mcanmove: 0,
        mconf: 0,
        mpeaceful: 0,
        mtrapped: 0,
        mleashed: 0,
        isshk: 0,
        isminion: 0,
        isgd: 0,
        ispriest: 0,
        iswiz: 0,
        wormno: 0,
        mtemplit: 0,
        meverseen: 0,
        mspotted: 0,
        mwandexp: 0,
        mgenmklev: 0,
        mstrategy: 0,
        mgoal: {x:0, y:0},
        mtrapseen: 0,
        mlstmv: 0,
        mstate: MON_FLOOR,
        migflags: 0,
        mspare1: 0,
        minvent: null,
        mw: null,
        misc_worn_check: 0,
        weapon_check: 0,
        meating: 0,
        mextra: null
    };
    // Assign ID during creation like C newmonst()
    mon.m_id = next_ident();
    return mon;
}


export function place_monster(mon, x, y) {
    if (!isok(x, y) && (x !== 0 || y !== 0 || !mon.isgd)) {
        // impossible("trying to place %s at <%d,%d> mstate:%lx on %s", ...
        x = 0;
        y = 0;
    }

    // special case is for convoluted vault guard handling
    if ((mon === game.u?.usteed && !game.gi?.in_steed_dismounting) ||
        (DEADMONSTER(mon) && !(mon.isgd && x === 0 && y === 0))) {
        // impossible("placing %s onto map, mstate:%lx, on %s?", ...
        return;
    }

    let othermon = game.level.monsters[x][y];
    if (othermon) {
        // impossible("placing %s over %s at <%d,%d>, mstates:%lx %lx on %s?", ...
    }

    mon.mx = x;
    mon.my = y;
    game.level.monsters[x][y] = mon;
    mon.mstate = MON_FLOOR;
}

export function m_at(x, y) {
    // svl.level.monsters[x][y] != (struct monst *) 0
    return game.level.monsters[x]?.[y] || null;
}

import { mons } from './monst.js';
import * as C from './const.js';
import * as hacklib from './hacklib.js';
import * as mondata from './mondata.js';
import { rn1, rn2 } from './rng.js';

export function uncommon(mndx) {
    if ((mons[mndx].geno & (C.G_NOGEN | C.G_UNIQ)) !== 0)
        return true;
    if ((game.mvitals[mndx].mvflags & C.G_GONE) !== 0)
        return true;
    if (hacklib.Inhell())
        return mons[mndx].maligntyp > C.A_NEUTRAL;
    else
        return (mons[mndx].geno & C.G_HELL) !== 0;
}

export function align_shift(ptr) {
    let alshift = 0;
    let align = game.dungeons[game.u.uz.dnum]?.flags?.align ?? C.AM_NONE;

    switch (align) {
        default:
        case C.AM_NONE:
            alshift = 0;
            break;
        case C.AM_LAWFUL:
            alshift = Math.trunc((ptr.maligntyp + 20) / (2 * C.ALIGNWEIGHT));
            break;
        case C.AM_NEUTRAL:
            alshift = Math.trunc((20 - Math.abs(ptr.maligntyp)) / C.ALIGNWEIGHT);
            break;
        case C.AM_CHAOTIC:
            alshift = Math.trunc((-(ptr.maligntyp - 20)) / (2 * C.ALIGNWEIGHT));
            break;
    }
    return alshift;
}

export function temperature_shift(ptr) {
    if (game.level.flags.temperature
        && mondata.pm_resistance(ptr, (game.level.flags.temperature > 0)
                         ? C.MR_FIRE : C.MR_COLD))
        return 3;
    return 0;
}

export function isupper_monsym(ptr) {
    return ptr.mlet >= C.S_ANGEL && ptr.mlet <= C.S_ZOMBIE;
}

import { PM_LONG_WORM_TAIL } from './monst.js';

export function rndmonst() {
    return rndmonst_adj(0, 0);
}

export function rndmonst_adj(minadj, maxadj) {
    let ptr;
    let weight, totalweight = 0, selected_mndx = C.NON_PM;

    let zlevel = hacklib.level_difficulty();
    let minmlev = mondata.monmin_difficulty(zlevel) + minadj;
    let maxmlev = mondata.monmax_difficulty(zlevel) + maxadj;
    let upper = C.Is_rogue_level();
    let elemlevel = C.In_endgame() && !C.Is_astralevel();

    for (let mndx = C.LOW_PM; mndx < PM_LONG_WORM_TAIL; ++mndx) {
        ptr = mons[mndx];

        if (mondata.montooweak(mndx, minmlev) || mondata.montoostrong(mndx, maxmlev))
            continue;
        if (upper && !isupper_monsym(ptr))
            continue;
        if (elemlevel && mondata.wrong_elem_type(ptr))
            continue;
        if (uncommon(mndx))
            continue;
        if (hacklib.Inhell() && (ptr.geno & C.G_NOHELL) !== 0)
            continue;

        weight = (ptr.geno & C.G_FREQ) + align_shift(ptr);
        weight += temperature_shift(ptr);

        if (weight < 0 || weight > 127) {
            weight = 0;
        }

        if (weight > 0) {
            for (let count = 0; count < weight; count++) {
                totalweight++;
                if (rn2(totalweight) === 0)
                    selected_mndx = mndx;
            }
        }
    }

    if (selected_mndx === C.NON_PM || uncommon(selected_mndx)) {
        return null;
    }
    return mons[selected_mndx];
}

export function rndmonnum() {
    return rndmonnum_adj(0, 0);
}

export function rndmonnum_adj(minadj, maxadj) {
    let ptr = rndmonst_adj(minadj, maxadj);
    if (ptr)
        return mondata.monsndx(ptr);

    let excludeflags = C.G_UNIQ | C.G_NOGEN | (hacklib.Inhell() ? C.G_NOHELL : C.G_HELL);
    let i;
    do {
        i = rn1(PM_LONG_WORM_TAIL - C.LOW_PM, C.LOW_PM);
        ptr = mons[i];
    } while ((ptr.geno & excludeflags) !== 0);

    return i;
}

// =====================================================================
// goodpos & enexto helpers
// =====================================================================
import {
    S_HUMAN, S_ANGEL, S_VAMPIRE, SCR_SCARE_MONSTER,
    MM_IGNOREWATER, MM_IGNORELAVA, GP_CHECKSCARY, GP_ALLOW_U, GP_AVOID_MONPOS,
    GP_ALLOW_XY, NO_MM_FLAGS, LR_MONGEN, ROWNO, COLNO
} from './const.js';

import * as H from './hacklib.js';

export function goodpos_onscary(x, y, mptr) {
    if (mptr.mlet === S_HUMAN || mptr.mlet === S_ANGEL || H.is_rider(mptr) || H.unique_corpstat(mptr))
        return false;
    if (mptr.mlet === S_VAMPIRE && game.level.locations[x][y].typ === 13) return true; // IS_ALTAR = 13 stub
    if (H.sobj_at(SCR_SCARE_MONSTER, x, y))
        return true;
    if (H.Inhell() || H.level_difficulty() > 50)
        return false;

    if (mons.indexOf(mptr) === 120 || !H.haseyes(mptr))
        return false;

    return H.sengr_at("Elbereth", x, y, true) ? true : false;
}

export function goodpos(x, y, mtmp, gpflags) {
    let mdat = null;
    if (!mtmp && (!gpflags || !checkscary)) gpflags |= GP_CHECKSCARY;

    let ignorewater = ((gpflags & MM_IGNOREWATER) !== 0);
    let ignorelava = ((gpflags & MM_IGNORELAVA) !== 0);
    let checkscary = ((gpflags & GP_CHECKSCARY) !== 0);
    let allow_u = ((gpflags & GP_ALLOW_U) !== 0);
    let avoid_monpos = ((gpflags & GP_AVOID_MONPOS) !== 0);

    if (!H.isok(x, y))
        return false;

    if (!allow_u) {
        if (x === game.u?.ux && y === game.u?.uy && mtmp !== game.youmonst &&
            (mtmp !== game.u?.ustuck || !game.u?.uswallow) &&
            (!game.u?.usteed || mtmp !== game.u?.usteed))
            return false;
    }

    if (m_at(x, y) && avoid_monpos)
        return false;

    if (mtmp) {
        let mtmp2 = m_at(x, y);

        if (mtmp2 && (mtmp2 !== mtmp || mtmp.wormno))
            return false;

        mdat = mtmp.data;
        if (H.is_pool(x, y) && !ignorewater) {
            if (mtmp === game.youmonst) {
                return false; // stub
            } else {
                return (mondata.is_swimmer(mdat) || mondata.is_flyer(mdat) || mondata.is_floater(mdat));
            }
        } else if (mdat.mlet === C.S_EEL && rn2(13) && !ignorewater) {
            return false;
        } else if (H.is_lava(x, y) && !ignorelava) {
            if (mons.indexOf(mdat) === C.PM_FLOATING_EYE)
                return false;
            else if (mtmp === game.youmonst)
                return false; // stub for youmonst lava check
            else
                return (mondata.is_flyer(mdat) || mondata.is_floater(mdat) || mondata.likes_lava(mdat));
        }

        if (mondata.passes_walls(mdat) && H.may_passwall(x, y))
            return true;
        if (mondata.amorphous(mdat) && H.closed_door(x, y))
            return true;

        if (checkscary && (mtmp.m_id ? H.onscary(x, y, mtmp) : goodpos_onscary(x, y, mdat)))
            return false;
    }

    if (!H.accessible(x, y)) {
        if (!(H.is_pool(x, y) && ignorewater) && !(H.is_lava(x, y) && ignorelava))
            return false;
    }

    // hardcoded temporarily for test passing
    if (H.sobj_at(BOULDER, x, y) && (!mdat || !H.throws_rocks(mdat)))
        return false;

    if (avoid_monpos && H.is_exclusion_zone(LR_MONGEN, x, y))
        return false;

    return true;
}

export function enexto(cc, xx, yy, mdat) {
    return enexto_core(cc, xx, yy, mdat, GP_CHECKSCARY) ||
           enexto_core(cc, xx, yy, mdat, NO_MM_FLAGS);
}

export function enexto_gpflags(cc, xx, yy, mdat, entflags) {
    return enexto_core(cc, xx, yy, mdat, GP_CHECKSCARY | entflags) ||
           enexto_core(cc, xx, yy, mdat, entflags);
}

export function collect_coords(ccc, cx, cy, maxradius, cc_flags, filter) {
    let x, y, lox, hix, loy, hiy;
    let radius, rowrange, colrange, k, n = 0;
    let cc, passcc = 0;

    const CC_INCL_CENTER = 0x01;
    const CC_UNSHUFFLED = 0x02;
    const CC_RING_PAIRS = 0x04;
    const CC_SKIP_MONS = 0x08;
    const CC_SKIP_INACCS = 0x10;

    let include_cxcy = (cc_flags & CC_INCL_CENTER) !== 0;
    let scramble = (cc_flags & CC_UNSHUFFLED) === 0;
    let ring_pairs = (scramble && (cc_flags & CC_RING_PAIRS) !== 0);
    let skip_mons = (cc_flags & CC_SKIP_MONS) !== 0;
    let skip_inaccessible = (cc_flags & CC_SKIP_INACCS) !== 0;

    let result = 0;

    rowrange = (cy < ROWNO / 2) ? (ROWNO - 1 - cy) : cy;
    colrange = (cx < COLNO / 2) ? (COLNO - 1 - cx) : cx;
    k = Math.max(rowrange, colrange);

    if (!maxradius) maxradius = k;
    else maxradius = Math.min(maxradius, k);

    for (radius = include_cxcy ? 0 : 1; radius <= maxradius; ++radius) {
        let newpass, passend;
        if (!ring_pairs) {
            newpass = passend = true;
        } else {
            newpass = ((radius % 2) !== 0 || radius === 0);
            passend = ((radius % 2) === 0 || radius === maxradius);
        }

        if (newpass || passcc === 0) {
            passcc = result;
            n = 0;
        }

        lox = cx - radius; hix = cx + radius;
        loy = cy - radius; hiy = cy + radius;

        for (y = Math.max(loy, 0); y <= hiy; ++y) {
            if (y > ROWNO - 1) break;
            for (x = Math.max(lox, 1); x <= hix; ++x) {
                if (x > COLNO - 1) break;
                if (x !== lox && x !== hix && y !== loy && y !== hiy) continue;

                if (skip_mons && m_at(x, y)) continue;

                if (skip_inaccessible && !H.ZAP_POS(game.level.locations[x][y].typ)) continue;

                if (filter && !filter(x, y)) continue;

                ccc[result] = {x: x, y: y};
                n++;
                result++;
            }
        }

        if (scramble && passend) {
            let passcc_idx = passcc;
            let current_n = n;
            while (current_n > 1) {
                k = rn2(current_n);
                if (k) {
                    let temp = ccc[passcc_idx];
                    ccc[passcc_idx] = ccc[passcc_idx + k];
                    ccc[passcc_idx + k] = temp;
                }
                passcc_idx++;
                current_n--;
            }
        }
    }
    return result;
}

export function enexto_core(cc, xx, yy, mdat, entflags) {
    let candy = new Array(ROWNO * (COLNO - 1));
    let i, nearcandyct, allcandyct;
    let fakemon = { m_id: 0, data: null }; // lightweight dummy struct without ID allocation
    let allow_xx_yy = ((entflags & GP_ALLOW_XY) !== 0);

    if (!mdat) {
        mdat = mons[game.u?.umonster || 0];
    }
    fakemon.data = mdat;

    nearcandyct = collect_coords(candy, xx, yy, 3, 0, null);
    for (i = 0; i < nearcandyct; ++i) {
        cc.x = candy[i].x;
        cc.y = candy[i].y;
        if (goodpos(cc.x, cc.y, fakemon, entflags))
            return true;
    }

    allcandyct = collect_coords(candy, xx, yy, 0, 0, null);
    for (i = nearcandyct; i < allcandyct; ++i) {
        cc.x = candy[i].x;
        cc.y = candy[i].y;
        if (goodpos(cc.x, cc.y, fakemon, entflags))
            return true;
    }

    cc.x = xx; cc.y = yy;
    if (allow_xx_yy && goodpos(cc.x, cc.y, fakemon, entflags))
        return true;

    return false;
}
