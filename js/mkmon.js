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


import { cansee } from './vision.js';

// C ref: teleport.c
export function goodpos_onscary(x, y, mptr) {
    if (mptr.mlet === C.S_HUMAN || mptr.mlet === C.S_ANGEL)
        return false;

    // Some simplifications since macro is missing or we just don't have it
    // IS_ALTAR, is_rider, unique_corpstat omitted for brevity.
    if (hacklib.sobj_at(C.SCR_SCARE_MONSTER, x, y))
        return true;

    if (hacklib.Inhell() || C.In_endgame())
        return false;

    if (mptr === mons[C.PM_MINOTAUR] || !mondata.haseyes(mptr))
        return false;

    return hacklib.sengr_at("Elbereth", x, y, true) ? true : false;
}

// C ref: teleport.c
export function goodpos(x, y, mtmp, gpflags) {
    let mdat = null;
    let ignorewater = ((gpflags & C.MM_IGNOREWATER) !== 0);
    let ignorelava = ((gpflags & C.MM_IGNORELAVA) !== 0);
    let checkscary = ((gpflags & C.GP_CHECKSCARY) !== 0);
    let allow_u = ((gpflags & C.GP_ALLOW_U) !== 0);
    let avoid_monpos = ((gpflags & C.GP_AVOID_MONPOS) !== 0);

    if (!hacklib.isok(x, y))
        return false;

    if (!allow_u) {
        if (game.u && game.u.ux === x && game.u.uy === y && mtmp !== game.u?.youmonst) {
            // Simplification: just return false if u_at(x,y)
            return false;
        }
    }

    if (game.level && game.level.monsters[x] && game.level.monsters[x][y] && avoid_monpos)
        return false;

    if (mtmp) {
        let mtmp2 = m_at(x, y);

        if (mtmp2 && (mtmp2 !== mtmp || mtmp.wormno))
            return false;

        mdat = mtmp.data;
        if (hacklib.is_pool(x, y) && !ignorewater) {
            if (mtmp === game.u?.youmonst)
                return false; // Stub
            else
                return (hacklib.is_swimmer(mdat) || (!C.Is_waterlevel() && !hacklib.is_waterwall(x, y) && hacklib.m_in_air(mtmp)));
        } else if (mdat && mdat.mlet === C.S_EEL && rn2(13) && !ignorewater) {
            return false;
        } else if (hacklib.is_lava(x, y) && !ignorelava) {
            if (mdat === mons[C.PM_FLOATING_EYE])
                return false;
            else if (mtmp === game.u?.youmonst)
                return false; // Stub
            else
                return (hacklib.m_in_air(mtmp) || hacklib.likes_lava(mdat));
        }

        if (hacklib.passes_walls(mdat) && hacklib.may_passwall(x, y))
            return true;
        if (hacklib.amorphous(mdat) && hacklib.closed_door(x, y))
            return true;

        if (checkscary && (mtmp.m_id ? hacklib.onscary(x, y, mtmp) : goodpos_onscary(x, y, mdat)))
            return false;
    }

    if (!hacklib.accessible(x, y)) {
        if (!(hacklib.is_pool(x, y) && ignorewater) && !(hacklib.is_lava(x, y) && ignorelava))
            return false;
    }

    if (hacklib.sobj_at(C.BOULDER, x, y) && (!mdat || !hacklib.throws_rocks(mdat)))
        return false;

    if (avoid_monpos && hacklib.is_exclusion_zone(C.LR_MONGEN, x, y))
        return false;

    return true;
}

// C ref: teleport.c
export function enexto_core(cc, xx, yy, mdat, entflags) {
    const MAX_GOOD = 15;
    let good = [];
    let x, y, range, i;
    let xmin, xmax, ymin, ymax, rangemax;
    let fakemon = { data: null }; // simulating cg.zeromonst structure
    let allow_xx_yy = ((entflags & C.GP_ALLOW_XY) !== 0);

    entflags &= ~C.GP_ALLOW_XY;
    if (!mdat) {
        mdat = mons[game.u?.umonster || 0]; // default to player's original monster type if u is defined
    }

    // set up for goodpos
    mondata.set_mon_data(fakemon, mdat);

    xmax = Math.max(xx - 1, (C.COLNO - 1) - xx);
    ymax = Math.max(yy - 0, (C.ROWNO - 1) - yy);
    rangemax = Math.max(xmax, ymax);

    range = 1;
    outer_loop: do {
        xmin = Math.max(1, xx - range);
        xmax = Math.min(C.COLNO - 1, xx + range);
        ymin = Math.max(0, yy - range);
        ymax = Math.min(C.ROWNO - 1, yy + range);

        for (x = xmin; x <= xmax; x++) {
            if (goodpos(x, ymin, fakemon, entflags)) {
                good.push({x: x, y: ymin});
                if (good.length === MAX_GOOD) break outer_loop;
            }
            if (goodpos(x, ymax, fakemon, entflags)) {
                good.push({x: x, y: ymax});
                if (good.length === MAX_GOOD) break outer_loop;
            }
        }
        for (y = ymin; y < ymax; y++) {
            if (goodpos(xmin, y, fakemon, entflags)) {
                good.push({x: xmin, y: y});
                if (good.length === MAX_GOOD) break outer_loop;
            }
            if (goodpos(xmax, y, fakemon, entflags)) {
                good.push({x: xmax, y: y});
                if (good.length === MAX_GOOD) break outer_loop;
            }
        }
    } while (++range <= rangemax && good.length === 0);

    if (good.length === 0) {
        cc.x = xx;
        cc.y = yy;
        if (allow_xx_yy && goodpos(xx, yy, fakemon, entflags)) {
            return true;
        } else {
            return false;
        }
    }

    i = rn2(good.length);
    cc.x = good[i].x;
    cc.y = good[i].y;
    return true;
}

// C ref: teleport.c
export function enexto(cc, xx, yy, mdat) {
    return (enexto_core(cc, xx, yy, mdat, C.GP_CHECKSCARY) || enexto_core(cc, xx, yy, mdat, C.NO_MM_FLAGS));
}

// C ref: teleport.c
export function enexto_gpflags(cc, xx, yy, mdat, entflags) {
    return (enexto_core(cc, xx, yy, mdat, C.GP_CHECKSCARY | entflags) || enexto_core(cc, xx, yy, mdat, entflags));
}

// C ref: makemon.c
export function makemon_rnd_goodpos(mon, gpflags, cc) {
    let tryct = 0;
    let nx, ny;
    let good;

    gpflags |= C.GP_AVOID_MONPOS;
    do {
        nx = rn1(C.COLNO - 3, 2);
        ny = rn2(C.ROWNO);
        good = (!game.gi?.in_mklev && cansee(nx, ny)) ? false : goodpos(nx, ny, mon, gpflags);
    } while ((++tryct < 50) && !good);

    if (!good) {
        let xofs = nx;
        let yofs = ny;
        let dx, dy;
        let bl = (game.gi?.in_mklev || (game.u && game.u.uprops?.Blind)) ? 1 : 0;

        for (; bl < 2; bl++) {
            if (!bl)
                gpflags &= ~C.GP_CHECKSCARY;
            for (dx = 0; dx < C.COLNO; dx++) {
                for (dy = 0; dy < C.ROWNO; dy++) {
                    nx = ((dx + xofs) % (C.COLNO - 1)) + 1;
                    ny = ((dy + yofs) % (C.ROWNO - 1)) + 1;
                    if (bl === 0 && cansee(nx, ny))
                        continue;
                    if (goodpos(nx, ny, mon, gpflags)) {
                        cc.x = nx;
                        cc.y = ny;
                        return true;
                    }
                }
            }
            if (bl === 0 && (!mon || (mon.data && mon.data.mmove))) {
                let stway = game.stairs;
                while (stway) {
                    if (stway.tolev.dnum === game.u.uz.dnum && !rn2(2)) {
                        nx = stway.sx;
                        ny = stway.sy;
                        break;
                    }
                    stway = stway.next;
                }
                if (goodpos(nx, ny, mon, gpflags)) {
                    cc.x = nx;
                    cc.y = ny;
                    return true;
                }
            }
        }
    } else {
        cc.x = nx;
        cc.y = ny;
        return true;
    }
    return false;
}
