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
import { cansee } from './vision.js';

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

import { canseemon } from './vision.js';
export const CC_NO_FLAGS    = 0;
export const CC_INCL_CENTER = 1;
export const CC_UNSHUFFLED  = 2;
export const CC_RING_PAIRS  = 4;
export const CC_SKIP_MONS   = 8;
export const CC_SKIP_INACCS = 16;

export function collect_coords(ccc, cx, cy, maxradius, cc_flags, filter) {
    let x, y, lox, hix, loy, hiy;
    let radius, rowrange, colrange, k, n = 0;
    let newpass, passend;

    let include_cxcy = (cc_flags & CC_INCL_CENTER) !== 0;
    let scramble = (cc_flags & CC_UNSHUFFLED) === 0;
    let ring_pairs = (scramble && (cc_flags & CC_RING_PAIRS) !== 0);
    let skip_mons = (cc_flags & CC_SKIP_MONS) !== 0;
    let skip_inaccessible = (cc_flags & CC_SKIP_INACCS) !== 0;
    let result = 0;

    rowrange = (cy < Math.trunc(C.ROWNO / 2)) ? (C.ROWNO - 1 - cy) : cy;
    colrange = (cx < Math.trunc(C.COLNO / 2)) ? (C.COLNO - 1 - cx) : cx;
    k = Math.max(rowrange, colrange);

    if (!maxradius) maxradius = k;
    else maxradius = Math.min(maxradius, k);

    let passcc_idx = 0;

    for (radius = include_cxcy ? 0 : 1; radius <= maxradius; ++radius) {
        if (!ring_pairs) {
            newpass = passend = true;
        } else {
            newpass = ((radius % 2) !== 0 || radius === 0);
            passend = ((radius % 2) === 0 || radius === maxradius);
        }
        if (newpass || passcc_idx === -1) {
            passcc_idx = result;
            n = 0;
        }
        lox = cx - radius; hix = cx + radius;
        loy = cy - radius; hiy = cy + radius;
        for (y = Math.max(loy, 0); y <= hiy; ++y) {
            if (y > C.ROWNO - 1) break;
            for (x = Math.max(lox, 1); x <= hix; ++x) {
                if (x > C.COLNO - 1) break;
                if (x !== lox && x !== hix && y !== loy && y !== hiy) continue;
                if (skip_mons && m_at(x, y)) continue;
                if (skip_inaccessible && !C.ZAP_POS(game.level.locations[x][y].typ)) continue;
                if (filter && !filter(x, y)) continue;

                ccc[result] = { x, y };
                ++n;
                ++result;
            }
        }
        if (scramble && passend) {
            let n_shuf = n;
            let current_idx = passcc_idx;
            while (n_shuf > 1) {
                k = rn2(n_shuf);
                if (k) {
                    let temp = ccc[current_idx];
                    ccc[current_idx] = ccc[current_idx + k];
                    ccc[current_idx + k] = temp;
                }
                ++current_idx;
                --n_shuf;
            }
            if (!ring_pairs) { passcc_idx = -1; }
        }
    }
    return result;
}

export function goodpos_onscary(x, y, mptr) {
    if (mptr.mlet === C.S_HUMAN || mptr.mlet === C.S_ANGEL
        || mondata.is_rider(mptr) || mondata.unique_corpstat(mptr))
        return false;
    if (C.IS_ALTAR(game.level.locations[x][y].typ) && mptr.mlet === C.S_VAMPIRE)
        return true;
    if (hacklib.sobj_at(C.SCR_SCARE_MONSTER, x, y))
        return true;
    if (hacklib.Inhell() || C.In_endgame())
        return false;
    if (mptr === mons[C.PM_MINOTAUR] || !mondata.haseyes(mptr))
        return false;
    return hacklib.sengr_at("Elbereth", x, y, true) ? true : false;
}

export function goodpos(x, y, mtmp, gpflags) {
    let mdat = null;
    let ignorewater = (gpflags & C.MM_IGNOREWATER) !== 0;
    let ignorelava = (gpflags & C.MM_IGNORELAVA) !== 0;
    let checkscary = (gpflags & C.GP_CHECKSCARY) !== 0;
    let allow_u = (gpflags & C.GP_ALLOW_U) !== 0;
    let avoid_monpos = (gpflags & C.GP_AVOID_MONPOS) !== 0;

    if (!hacklib.isok(x, y)) return false;

    if (!allow_u) {
        if (x === game.u.ux && y === game.u.uy && mtmp !== game.youmonst
            && (mtmp !== game.u.ustuck || !game.u.uswallow)
            && (!game.u.usteed || mtmp !== game.u.usteed))
            return false;
    }

    if (m_at(x, y) && avoid_monpos) return false;

    if (mtmp) {
        let mtmp2 = m_at(x, y);

        if (mtmp2 && (mtmp2 !== mtmp || mtmp.wormno))
            return false;

        mdat = mtmp.data;
        if (hacklib.is_pool(x, y) && !ignorewater) {
            if (mtmp === game.youmonst)
                return (game.u.uprops[C.SWIMMING].extrinsic || game.u.uprops[C.SWIMMING].intrinsic || game.u.uprops[C.AMPHIBIOUS].extrinsic || game.u.uprops[C.AMPHIBIOUS].intrinsic
                        || (!C.Is_waterlevel() && !hacklib.is_waterwall(x, y)
                            && (game.u.uprops[C.LEVITATION].extrinsic || game.u.uprops[C.LEVITATION].intrinsic || game.u.uprops[C.FLYING].extrinsic || game.u.uprops[C.FLYING].intrinsic || game.u.uprops[C.WWALKING].extrinsic || game.u.uprops[C.WWALKING].intrinsic)));
            else
                return (mondata.is_swimmer(mdat)
                        || (!C.Is_waterlevel() && !hacklib.is_waterwall(x, y)
                            && hacklib.m_in_air(mtmp)));
        } else if (mdat && mdat.mlet === C.S_EEL && rn2(13) && !ignorewater) {
            return false;
        } else if (hacklib.is_lava(x, y) && !ignorelava) {
            if (mdat === mons[C.PM_FLOATING_EYE])
                return false;
            else if (mtmp === game.youmonst)
                return (game.u.uprops[C.LEVITATION].extrinsic || game.u.uprops[C.LEVITATION].intrinsic || game.u.uprops[C.FLYING].extrinsic || game.u.uprops[C.FLYING].intrinsic
                        || (game.u.uprops[C.FIRE_RES].extrinsic || game.u.uprops[C.FIRE_RES].intrinsic && game.u.uprops[C.WWALKING].extrinsic || game.u.uprops[C.WWALKING].intrinsic && game.u.uarmf && game.u.uarmf.oerodeproof)
                        || (game.u.uprops[C.POLYMORPH].extrinsic || game.u.uprops[C.POLYMORPH].intrinsic && hacklib.likes_lava(game.youmonst.data)));
            else
                return (hacklib.m_in_air(mtmp) || hacklib.likes_lava(mdat));
        }
        if (mdat && mondata.passes_walls(mdat) && hacklib.may_passwall(x, y)) return true;
        if (mdat && mondata.amorphous(mdat) && hacklib.closed_door(x, y)) return true;
        if (checkscary && mdat && (mtmp.m_id ? hacklib.onscary(x, y, mtmp) : goodpos_onscary(x, y, mdat)))
            return false;
    }

    if (!hacklib.accessible(x, y)) {
        if (!(hacklib.is_pool(x, y) && ignorewater)
            && !(hacklib.is_lava(x, y) && ignorelava))
            return false;
    }
    if (hacklib.sobj_at(C.BOULDER, x, y) && (!mdat || !mondata.throws_rocks(mdat))) return false;
    if (avoid_monpos && hacklib.is_exclusion_zone(C.LR_MONGEN, x, y)) return false;

    return true;
}

export function enexto(cc, xx, yy, mdat) {
    return enexto_core(cc, xx, yy, mdat, C.GP_CHECKSCARY) || enexto_core(cc, xx, yy, mdat, C.NO_MM_FLAGS);
}

export function enexto_gpflags(cc, xx, yy, mdat, entflags) {
    return enexto_core(cc, xx, yy, mdat, C.GP_CHECKSCARY | entflags) || enexto_core(cc, xx, yy, mdat, entflags);
}

export function enexto_core(cc, xx, yy, mdat, entflags) {
    let candy = new Array(C.ROWNO * (C.COLNO - 1));
    let i, nearcandyct, allcandyct;
    let fakemon = newmonst();
    let allow_xx_yy = (entflags & C.GP_ALLOW_XY) !== 0;

    if (!mdat) {
        mdat = mons[game.u.umonster];
    }
    fakemon.data = mdat;

    nearcandyct = collect_coords(candy, xx, yy, 3, CC_NO_FLAGS, null);
    for (i = 0; i < nearcandyct; ++i) {
        cc.x = candy[i].x; cc.y = candy[i].y;
        if (goodpos(cc.x, cc.y, fakemon, entflags)) return true;
    }

    allcandyct = collect_coords(candy, xx, yy, 0, CC_NO_FLAGS, null);
    for (i = nearcandyct; i < allcandyct; ++i) {
        cc.x = candy[i].x; cc.y = candy[i].y;
        if (goodpos(cc.x, cc.y, fakemon, entflags)) return true;
    }

    cc.x = xx; cc.y = yy;
    if (allow_xx_yy && goodpos(cc.x, cc.y, fakemon, entflags)) return true;

    return false;
}

export function makemon_rnd_goodpos(mon, gpflags, cc) {
    let tryct = 0;
    let nx, ny;
    let good;

    gpflags |= C.GP_AVOID_MONPOS;
    do {
        nx = rn1(C.COLNO - 3, 2);
        ny = rn2(C.ROWNO);
        good = (!game.in_mklev && cansee(nx,ny)) ? false : goodpos(nx, ny, mon, gpflags);
    } while ((++tryct < 50) && !good);

    if (!good) {
        let xofs = nx;
        let yofs = ny;
        let dx, dy;
        let bl = (game.in_mklev || game.u.uprops[C.BLINDED].extrinsic || game.u.uprops[C.BLINDED].intrinsic) ? 1 : 0;

        for ( ; bl < 2; bl++) {
            if (bl === 0) gpflags &= ~C.GP_CHECKSCARY;
            for (dx = 0; dx < C.COLNO; dx++) {
                for (dy = 0; dy < C.ROWNO; dy++) {
                    nx = ((dx + xofs) % (C.COLNO - 1)) + 1;
                    ny = ((dy + yofs) % (C.ROWNO - 1)) + 1;
                    if (bl === 0 && cansee(nx,ny)) continue;
                    if (goodpos(nx, ny, mon, gpflags)) {
                        cc.x = nx; cc.y = ny;
                        return true;
                    }
                }
            }
            if (bl === 0 && (!mon || mon.data.mmove)) {
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
                    cc.x = nx; cc.y = ny;
                    return true;
                }
            }
        }
    } else {
        cc.x = nx; cc.y = ny;
        return true;
    }
    return false;
}

export function makemon(ptr, x, y, mmflags) {
    let mtmp;
    let fakemon = { data: null };
    let cc = { x: 0, y: 0 };
    let mndx, mcham, ct, mitem;
    let femaleok, maleok,
        anymon = !ptr,
        byyou = (x === game.u.ux && y === game.u.uy),
        allow_minvent = ((mmflags & C.NO_MINVENT) === 0),
        countbirth = ((mmflags & C.MM_NOCOUNTBIRTH) === 0),
        allowtail = ((mmflags & C.MM_NOTAIL) === 0);
    let gpflags = (((mmflags & C.MM_IGNOREWATER) ? C.MM_IGNOREWATER : 0)
                   | C.GP_CHECKSCARY | C.GP_AVOID_MONPOS);

    if (game.iflags.debug_mongen || (!game.level.flags.rndmongen && !ptr))
        return null;

    if (x === 0 && y === 0) {
        fakemon.data = ptr;
        if (!makemon_rnd_goodpos(ptr ? fakemon : null, gpflags, cc))
            return null;
        x = cc.x; y = cc.y;
    } else if (byyou && !game.in_mklev) {
        if (!enexto_core(cc, game.u.ux, game.u.uy, ptr, gpflags)
            && !enexto_core(cc, game.u.ux, game.u.uy, ptr, gpflags & ~C.GP_CHECKSCARY))
            return null;
        x = cc.x; y = cc.y;
    }

    if (!hacklib.isok(x, y)) {
        return null;
    }

    if (m_at(x, y)) {
        if (!(mmflags & C.MM_ADJACENTOK) || !enexto_core(cc, x, y, ptr, gpflags))
            return null;
        x = cc.x; y = cc.y;
    }

    if (ptr) {
        mndx = mondata.monsndx(ptr);
        if ((game.mvitals[mndx].mvflags & C.G_GENOD) !== 0)
            return null;
        if (game.wizard && (game.mvitals[mndx].mvflags & C.G_EXTINCT) !== 0) {
            // debugpline1
        }
    } else {
        let tryct = 0;
        do {
            ptr = rndmonst();
            if (!ptr) {
                return null;
            }
            fakemon.data = ptr;
        } while (++tryct <= 50
                 && ((tryct === 1 && mondata.throws_rocks(ptr) && hacklib.In_sokoban())
                     || !goodpos(x, y, fakemon, gpflags)));
        mndx = mondata.monsndx(ptr);
    }

    hacklib.propagate(mndx, countbirth, false);
    mtmp = newmonst();

    if ((mmflags & C.MM_EGD) !== 0) hacklib.newegd(mtmp);
    if ((mmflags & C.MM_EPRI) !== 0) hacklib.newepri(mtmp);
    if ((mmflags & C.MM_ESHK) !== 0) hacklib.neweshk(mtmp);
    if ((mmflags & C.MM_EMIN) !== 0) hacklib.newemin(mtmp);
    if ((mmflags & C.MM_EDOG) !== 0) hacklib.newedog(mtmp);
    if ((mmflags & C.MM_ASLEEP) !== 0) mtmp.msleeping = 1;

    mtmp.nmon = game.fmon;
    game.fmon = mtmp;
    mtmp.data = ptr;

    if (ptr.msound === C.MS_LEADER && hacklib.quest_info(C.MS_LEADER) === mndx)
        game.quest_status.leader_m_id = mtmp.m_id;
    mtmp.mnum = mndx;

    hacklib.newmonhp(mtmp, mndx);

    femaleok = (!mondata.is_male(ptr) && !mondata.is_neuter(ptr));
    maleok = (!mondata.is_female(ptr) && !mondata.is_neuter(ptr));
    if (mondata.is_female(ptr) || ((mmflags & C.MM_FEMALE) !== 0 && femaleok))
        mtmp.female = 1;
    else if (mondata.is_male(ptr) || ((mmflags & C.MM_MALE) !== 0 && maleok))
        mtmp.female = 0;
    else if (ptr.msound === C.MS_LEADER && hacklib.quest_info(C.MS_LEADER) === mndx)
        mtmp.female = game.quest_status.ldrgend;
    else if (ptr.msound === C.MS_NEMESIS && hacklib.quest_info(C.MS_NEMESIS) === mndx)
        mtmp.female = game.quest_status.nemgend;
    else
        mtmp.female = femaleok ? rn2(2) : 0;

    if (hacklib.In_sokoban() && !mondata.mindless(ptr)) {
        hacklib.mon_learns_traps(mtmp, C.PIT);
        hacklib.mon_learns_traps(mtmp, C.HOLE);
    }
    if (hacklib.Is_stronghold() && !mondata.mindless(ptr))
        hacklib.mon_learns_traps(mtmp, C.TRAPDOOR);
    if (ptr.msound === C.MS_LEADER || ptr.msound === C.MS_NEMESIS)
        hacklib.mon_learns_traps(mtmp, C.ALL_TRAPS);
    if (hacklib.Is_stronghold() || hacklib.Is_knox() || C.In_endgame() ||
        hacklib.Inhell() || hacklib.In_V_tower() || hacklib.In_quest())
        mtmp.mwandexp = 1;

    place_monster(mtmp, x, y);
    mtmp.mcansee = mtmp.mcanmove = 1;
    mtmp.mgenmklev = game.in_mklev;
    mtmp.seen_resistance = C.M_SEEN_NOTHING;
    mtmp.mpeaceful = (mmflags & C.MM_ANGRY) ? 0 : hacklib.peace_minded(ptr);
    if ((mmflags & C.MM_MINVIS) !== 0)
        hacklib.mon_set_minvis(mtmp, false);

    switch (ptr.mlet) {
    case C.S_MIMIC:
        hacklib.set_mimic_sym(mtmp);
        break;
    case C.S_SPIDER:
    case C.S_SNAKE:
        if (game.in_mklev) {
            if (x && y)
                hacklib.mkobj_at(C.RANDOM_CLASS, x, y, true);
            hacklib.hideunder(mtmp);
        }
        break;
    case C.S_LIGHT:
    case C.S_ELEMENTAL:
        if (mndx === C.PM_STALKER || mndx === C.PM_BLACK_LIGHT) {
            mtmp.perminvis = 1;
            mtmp.minvis = 1;
        }
        break;
    case C.S_EEL:
        if (game.in_mklev) {
            hacklib.hideunder(mtmp);
        }
        break;
    case C.S_LEPRECHAUN:
        mtmp.msleeping = 1;
        break;
    case C.S_JABBERWOCK:
    case C.S_NYMPH:
        if (rn2(5) && !game.u.uhave.amulet)
            mtmp.msleeping = 1;
        break;
    case C.S_ORC:
        if (hacklib.Race_if(C.PM_ELF))
            mtmp.mpeaceful = 0;
        break;
    case C.S_UNICORN:
        if (mondata.is_unicorn(ptr) && Math.sign(game.u.ualign.type) === Math.sign(ptr.maligntyp))
            mtmp.mpeaceful = 1;
        break;
    case C.S_BAT:
        if (hacklib.Inhell() && mondata.is_bat(ptr))
            hacklib.mon_adjust_speed(mtmp, 2, null);
        break;
    }

    if ((ct = hacklib.emits_light(mtmp.data)) > 0)
        hacklib.new_light_source(mtmp.mx, mtmp.my, ct, C.LS_MONSTER, hacklib.monst_to_any(mtmp));

    mitem = C.STRANGE_OBJECT;

    if (mndx === C.PM_VLAD_THE_IMPALER)
        mitem = C.CANDELABRUM_OF_INVOCATION;
    mtmp.cham = C.NON_PM;
    if (!game.u.uprops[C.PROT_FROM_SHAPE_CHANGERS].extrinsic && !game.u.uprops[C.PROT_FROM_SHAPE_CHANGERS].intrinsic
        && (mcham = hacklib.pm_to_cham(mndx)) !== C.NON_PM) {
        mtmp.cham = mcham;
        if (mndx !== C.PM_VLAD_THE_IMPALER
            && hacklib.newcham(mtmp, null, C.NO_NC_FLAGS))
            allow_minvent = false;
    } else if (mndx === C.PM_WIZARD_OF_YENDOR) {
        mtmp.iswiz = 1;
        game.no_of_wizards++;
        if (game.no_of_wizards === 1 && C.Is_earthlevel())
            mitem = C.SPE_DIG;
    } else if (mndx === C.PM_GHOST && !(mmflags & C.MM_NONAME)) {
        mtmp = hacklib.christen_monst(mtmp, hacklib.rndghostname());
    } else if (mndx === C.PM_CROESUS) {
        mitem = C.TWO_HANDED_SWORD;
    } else if (ptr.msound === C.MS_NEMESIS) {
        mitem = C.BELL_OF_OPENING;
    } else if (mndx === C.PM_PESTILENCE) {
        mitem = C.POT_SICKNESS;
    }
    if (mitem !== C.STRANGE_OBJECT && allow_minvent)
        hacklib.mongets(mtmp, mitem);

    if (game.in_mklev) {
        if ((mondata.is_ndemon(ptr) || mndx === C.PM_WUMPUS
             || mndx === C.PM_LONG_WORM || mndx === C.PM_GIANT_EEL)
            && !game.u.uhave.amulet && rn2(5))
            mtmp.msleeping = 1;
    } else {
        if (byyou) {
            hacklib.newsym(mtmp.mx, mtmp.my);
            hacklib.set_apparxy(mtmp);
        }
    }
    if (mondata.is_dprince(ptr) && ptr.msound === C.MS_BRIBE) {
        mtmp.mpeaceful = mtmp.minvis = mtmp.perminvis = 1;
        mtmp.mavenge = 0;
        if (hacklib.u_wield_art(C.ART_EXCALIBUR) || hacklib.u_wield_art(C.ART_DEMONBANE))
            mtmp.mpeaceful = mtmp.mtame = 0;
    }
    if (mndx === C.PM_RAVEN && game.uwep && game.uwep.otyp === C.BEC_DE_CORBIN)
        mtmp.mpeaceful = 1;
    if (mndx === C.PM_LONG_WORM && (mtmp.wormno = hacklib.get_wormno()) !== 0) {
        hacklib.initworm(mtmp, allowtail ? rn2(5) : 0);
        if (hacklib.count_wsegs(mtmp))
            hacklib.place_worm_tail_randomly(mtmp, x, y);
    }
    if ((mndx === C.PM_ALIGNED_CLERIC || mndx === C.PM_HIGH_CLERIC)
            ? !(mmflags & (C.MM_EPRI | C.MM_EMIN))
            : (mndx === C.PM_ANGEL && !(mmflags & C.MM_EMIN) && !rn2(3))) {
        hacklib.newemin(mtmp);
        let eminp = mtmp.mextra.emin;
        mtmp.isminion = 1;
        eminp.min_align = rn2(3) - 1;
        eminp.renegade = (mmflags & C.MM_ANGRY) ? 1 : !rn2(3);
        mtmp.mpeaceful = (eminp.min_align === game.u.ualign.type)
                              ? !eminp.renegade
                              : eminp.renegade;
    }
    hacklib.set_malign(mtmp);
    if (anymon && !(mmflags & C.MM_NOGRP)) {
        if ((ptr.geno & C.G_SGROUP) && rn2(2)) {
            hacklib.m_initsgrp(mtmp, mtmp.mx, mtmp.my, mmflags);
        } else if (ptr.geno & C.G_LGROUP) {
            if (rn2(3))
                hacklib.m_initlgrp(mtmp, mtmp.mx, mtmp.my, mmflags);
            else
                hacklib.m_initsgrp(mtmp, mtmp.mx, mtmp.my, mmflags);
        }
    }

    if (allow_minvent) {
        if (mondata.is_armed(ptr))
            hacklib.m_initweap(mtmp);
        hacklib.m_initinv(mtmp);
        hacklib.m_dowear(mtmp, true);

        if (!rn2(100) && mondata.is_domestic(ptr)
            && hacklib.can_saddle(mtmp) && !hacklib.which_armor(mtmp, C.W_SADDLE)) {
            hacklib.put_saddle_on_mon(null, mtmp);
        }

    } else {
        if (mtmp.minvent)
            hacklib.discard_minvent(mtmp, true);
        mtmp.minvent = null;
    }
    if (ptr.mflags3 && !(mmflags & C.MM_NOWAIT)) {
        if (ptr.mflags3 & C.M3_WAITFORU)
            mtmp.mstrategy |= C.STRAT_WAITFORU;
        if (ptr.mflags3 & C.M3_CLOSE)
            mtmp.mstrategy |= C.STRAT_CLOSE;
        if (ptr.mflags3 & (C.M3_WAITMASK | C.M3_COVETOUS))
            mtmp.mstrategy |= C.STRAT_APPEARMSG;
    }

    if (allow_minvent && game.migrating_objs)
        hacklib.deliver_obj_to_mon(mtmp, 1, C.DF_NONE);

    if (!game.in_mklev) {
        hacklib.newsym(mtmp.mx, mtmp.my);
        if (!(mmflags & C.MM_NOMSG)) {
            let what = null;
            let exclaim = !(mmflags & C.MM_NOEXCLAM);

            if ((canseemon(mtmp) && (mtmp.m_ap_type === C.M_AP_NOTHING
                                     || mtmp.m_ap_type === C.M_AP_MONSTER))
                || hacklib.sensemon(mtmp)) {
                what = hacklib.Amonnam(mtmp);
                if (mtmp.m_ap_type === C.M_AP_MONSTER)
                    exclaim = true;
            } else if (hacklib.canseemon(mtmp)) {
                let mbuf = hacklib.mhidden_description(mtmp, C.MHID_ARTICLE | C.MHID_ALTMON);
                what = hacklib.upstart(mbuf);
            }
            if (what) {
                hacklib.set_msg_xy(mtmp.mx, mtmp.my);
                hacklib.Norep(`${what}${exclaim ? " suddenly" : ""} ${hacklib.vtense(what, "appear")}${hacklib.next2u(x, y) ? " next to you" : (hacklib.distu(x, y) <= (C.BOLT_LIM * C.BOLT_LIM)) ? " close by" : ""}${exclaim ? '!' : '.'}`);
            }
        }
        if (game.occupation)
            hacklib.dochugw(mtmp, false);
    }

    return mtmp;
}
