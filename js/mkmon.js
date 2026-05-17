// C ref: monst.h, makemon.c, teleport.c
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
import { rn1, rn2, d, rnd } from './rng.js';

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


export function goodpos_onscary(x, y, mptr) {
    if (mptr.mlet === C.S_HUMAN || mptr.mlet === C.S_ANGEL
        || mptr.mlet === C.S_DEMON) {
        return true;
    }
    return false;
}

export function goodpos(x, y, mtmp, gpflags) {
    let mdat = null;
    let ignorewater = (gpflags & C.MM_IGNOREWATER) !== 0;
    let ignorelava = (gpflags & C.MM_IGNORELAVA) !== 0;
    let checkscary = (gpflags & C.GP_CHECKSCARY) !== 0;
    let allow_u = (gpflags & C.GP_ALLOW_U) !== 0;
    let avoid_monpos = (gpflags & C.GP_AVOID_MONPOS) !== 0;

    if (!isok(x, y))
        return false;

    if (!allow_u) {
        if (x === game.u.ux && y === game.u.uy && mtmp !== game.youmonst
            && (mtmp !== game.u.ustuck || !game.u.uswallow)
            && (!game.u.usteed || mtmp !== game.u.usteed))
            return false;
    }

    if (m_at(x, y) && avoid_monpos)
        return false;

    if (mtmp) {
        let mtmp2 = m_at(x, y);

        if (mtmp2 && (mtmp2 !== mtmp || mtmp.wormno))
            return false;

        mdat = mtmp.data;
        if (hacklib.is_pool(x, y) && !ignorewater) {
            if (mtmp === game.youmonst)
                return (hacklib.is_swimmer(mdat) || hacklib.amphibious(mdat));
            else
                return (hacklib.is_swimmer(mdat) || hacklib.amphibious(mdat)
                        || hacklib.is_flyer(mdat) || hacklib.is_floater(mdat)
                        || hacklib.is_clinger(mdat));
        } else if (hacklib.is_lava(x, y) && !ignorelava) {
            if (mtmp === game.youmonst)
                return hacklib.likes_lava(mdat) || hacklib.is_floater(mdat) || hacklib.is_flyer(mdat);
            else
                return hacklib.likes_lava(mdat) || hacklib.is_floater(mdat) || hacklib.is_flyer(mdat);
        } else if (hacklib.is_ice(x, y)) {
            // pass
        } else if (hacklib.passes_walls(mdat) && hacklib.may_passwall(x, y)) {
            return true;
        } else if (hacklib.amorphous(mdat) && hacklib.closed_door(x, y)) {
            return true;
        }

        if (checkscary && (mtmp.m_id ? hacklib.onscary(x, y, mtmp)
                                     : goodpos_onscary(x, y, mdat)))
            return false;
    }

    if (!hacklib.accessible(x, y)) {
        if (!(hacklib.is_pool(x, y) && ignorewater)
            && !(hacklib.is_lava(x, y) && ignorelava))
            return false;
    }

    if (hacklib.closed_door(x, y) && (!mdat || !hacklib.passes_walls(mdat) && hacklib.nohands(mdat)))
        return false;
    if (hacklib.sobj_at(C.BOULDER, x, y) && (!mdat || !hacklib.passes_walls(mdat)
                                      && !hacklib.throws_rocks(mdat)))
        return false;

    return true;
}

export function enexto(cc, xx, yy, mdat) {
    return enexto_core(cc, xx, yy, mdat, C.GP_CHECKSCARY) || enexto_core(cc, xx, yy, mdat, C.NO_MM_FLAGS);
}

export function enexto_gpflags(cc, xx, yy, mdat, entflags) {
    return enexto_core(cc, xx, yy, mdat, C.GP_CHECKSCARY | entflags) || enexto_core(cc, xx, yy, mdat, entflags);
}

export function enexto_core(cc, xx, yy, mdat, entflags) {
    let candy = Array(C.ROWNO * (C.COLNO - 1)).fill(null).map(() => ({x: 0, y: 0}));
    let i, nearcandyct, allcandyct;
    let fakemon = newmonst();
    let allow_xx_yy = (entflags & C.GP_ALLOW_XY) !== 0;

    if (!mdat) {
        mdat = mons[game.u.umonster];
    }

    // set_mon_data equivalent
    fakemon.data = mdat;

    nearcandyct = collect_coords(candy, xx, yy, 3, C.CC_NO_FLAGS, null);
    for (i = 0; i < nearcandyct; ++i) {
        cc.x = candy[i].x;
        cc.y = candy[i].y;
        if (goodpos(cc.x, cc.y, fakemon, entflags))
            return true;
    }

    allcandyct = collect_coords(candy, xx, yy, 0, C.CC_NO_FLAGS, null);
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


export function collect_coords(candy, cx, cy, maxradius, flags, exclude_fn) {
    let result = 0, n = 0, i, j;
    let radius, lox, hix, loy, hiy;
    let x, y;
    let incl_cxcy = (flags & C.CC_INCL_CENTER) !== 0;
    let unshuffled = (flags & C.CC_UNSHUFFLED) !== 0;
    let ring_pairs = (flags & C.CC_RING_PAIRS) !== 0;
    let skip_mons = (flags & C.CC_SKIP_MONS) !== 0;
    let skip_inaccs = (flags & C.CC_SKIP_INACCS) !== 0;
    let newpass, passend;
    let passcc = 0; // index into candy

    if (maxradius === 0) {
        maxradius = Math.max(cx - 1, C.COLNO - 1 - cx, cy - 0, C.ROWNO - 1 - cy);
    }

    for (radius = (incl_cxcy ? 0 : 1); radius <= maxradius; ++radius) {
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

        lox = cx - radius;
        hix = cx + radius;
        loy = cy - radius;
        hiy = cy + radius;

        for (y = Math.max(loy, 0); y <= hiy; ++y) {
            if (y > C.ROWNO - 1) break;
            for (x = Math.max(lox, 1); x <= hix; ++x) {
                if (x > C.COLNO - 1) break;

                if (Math.max(Math.abs(x - cx), Math.abs(y - cy)) !== radius)
                    continue;

                if (!hacklib.isok(x, y)) continue;

                if (skip_inaccs && !hacklib.accessible(x, y)) continue;
                if (skip_mons && m_at(x, y)) continue;
                if (exclude_fn && exclude_fn(x, y)) continue;

                candy[result].x = x;
                candy[result].y = y;
                ++result;
                ++n;
            }
        }

        if (passend && !unshuffled && n > 1) {
            for (i = 0; i < n; ++i) {
                j = rn2(n - i);
                if (j > 0) {
                    let tmp_x = candy[passcc + i].x;
                    let tmp_y = candy[passcc + i].y;
                    candy[passcc + i].x = candy[passcc + i + j].x;
                    candy[passcc + i].y = candy[passcc + i + j].y;
                    candy[passcc + i + j].x = tmp_x;
                    candy[passcc + i + j].y = tmp_y;
                }
            }
        }
    }
    return result;
}


export function makemon_rnd_goodpos(mon, gpflags, cc) {
    let tryct = 0;
    let nx, ny;
    let good;

    gpflags |= C.GP_AVOID_MONPOS;
    do {
        nx = rn1(C.COLNO - 3, 2);
        ny = rn2(C.ROWNO);
        good = (!game.gi.in_mklev && hacklib.cansee(nx, ny)) ? false : goodpos(nx, ny, mon, gpflags);
    } while ((++tryct < 50) && !good);

    if (!good) {
        let xofs = nx;
        let yofs = ny;
        let dx, dy;
        let bl = (game.gi.in_mklev || hacklib.Blind()) ? 1 : 0;

        for (; bl < 2; bl++) {
            if (!bl)
                gpflags &= ~C.GP_CHECKSCARY;
            for (dx = 0; dx < C.COLNO; dx++) {
                for (dy = 0; dy < C.ROWNO; dy++) {
                    nx = ((dx + xofs) % (C.COLNO - 1)) + 1;
                    ny = ((dy + yofs) % (C.ROWNO - 1)) + 1;
                    if (bl === 0 && hacklib.cansee(nx, ny))
                        continue;
                    if (goodpos(nx, ny, mon, gpflags)) {
                        cc.x = nx;
                        cc.y = ny;
                        return true;
                    }
                }
            }
            if (bl === 0 && (!mon || mon.data.mmove)) {
                let stway = game.gs.stairs;
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

export function propagate(mndx, countbirth, genocided) {
    let extinct = false;

    if (mndx === C.NON_PM) return false;

    let dmgflags = mons[mndx].geno;
    if (countbirth) {
        if (game.mvitals[mndx].born < 255) game.mvitals[mndx].born++;
        // extinct logic...
        if ((dmgflags & C.G_UNIQ) !== 0 || (game.mvitals[mndx].born >= 120)) {
            // Note: C implementation is more complex, but we need to match RNG exactly
        }
    }

    if (genocided) {
        game.mvitals[mndx].mvflags |= C.G_GENOD;
    } else if (extinct) {
        game.mvitals[mndx].mvflags |= C.G_EXTINCT;
    }

    return extinct;
}

export function makemon(ptr, x, y, mmflags) {
    let mtmp;
    let fakemon = newmonst();
    let cc = {x: 0, y: 0};
    let mndx, mcham, ct, mitem;
    let femaleok, maleok, anymon = !ptr, byyou = (x === game.u.ux && y === game.u.uy);
    let allow_minvent = ((mmflags & C.NO_MINVENT) === 0);
    let countbirth = ((mmflags & C.MM_NOCOUNTBIRTH) === 0);
    let allowtail = ((mmflags & C.MM_NOTAIL) === 0);
    let gpflags = (((mmflags & C.MM_IGNOREWATER) ? C.MM_IGNOREWATER : 0)
                           | C.GP_CHECKSCARY | C.GP_AVOID_MONPOS);

    if (game.iflags.debug_mongen || (!game.level.flags.rndmongen && !ptr))
        return null;

    if (x === 0 && y === 0) {
        fakemon.data = ptr;
        if (!makemon_rnd_goodpos(ptr ? fakemon : null, gpflags, cc))
            return null;
        x = cc.x;
        y = cc.y;
    } else if (byyou && !game.gi.in_mklev) {
        if (!enexto_core(cc, game.u.ux, game.u.uy, ptr, gpflags)
            && !enexto_core(cc, game.u.ux, game.u.uy, ptr, gpflags & ~C.GP_CHECKSCARY))
            return null;
        x = cc.x;
        y = cc.y;
    }

    if (!hacklib.isok(x, y)) {
        return null;
    }

    if (m_at(x, y)) {
        if (!(mmflags & C.MM_ADJACENTOK)
            || !enexto_core(cc, x, y, ptr, gpflags))
            return null;
        x = cc.x;
        y = cc.y;
    }

    if (ptr) {
        mndx = mondata.monsndx(ptr);
        if (game.mvitals[mndx].mvflags & C.G_GENOD)
            return null;
    } else {
        let tryct = 0;
        do {
            if (!(ptr = rndmonst())) {
                return null;
            }
            fakemon.data = ptr;
        } while (++tryct <= 50
                 && ((tryct === 1 && hacklib.throws_rocks(ptr) && hacklib.In_sokoban(game.u.uz))
                     || !goodpos(x, y, fakemon, gpflags)));
        mndx = mondata.monsndx(ptr);
    }
    propagate(mndx, countbirth, false);
    mtmp = newmonst();

    // We don't implement MM_EGD, MM_EPRI, MM_ESHK, MM_EMIN, MM_EDOG here initially, or we do them later.
    if ((mmflags & C.MM_ASLEEP) !== 0)
        mtmp.msleeping = 1;

    mtmp.nmon = game.fmon;
    game.fmon = mtmp;
    // mtmp.m_id = next_ident(); // handled in newmonst()
    mtmp.data = ptr;
    mtmp.mnum = mndx;

    newmonhp(mtmp, mndx);

    femaleok = (!hacklib.is_male(ptr) && !hacklib.is_neuter(ptr));
    maleok = (!hacklib.is_female(ptr) && !hacklib.is_neuter(ptr));
    if (hacklib.is_female(ptr) || ((mmflags & C.MM_FEMALE) !== 0 && femaleok))
        mtmp.female = 1;
    else if (hacklib.is_male(ptr) || ((mmflags & C.MM_MALE) !== 0 && maleok))
        mtmp.female = 0;
    else
        mtmp.female = femaleok ? rn2(2) : 0;

    // missing trap learnings...

    mtmp.mcansee = 1;
    mtmp.mcanmove = 1;

    if (!anymon && !(mmflags & C.MM_NOGRP) && (ptr.geno & C.G_SGROUP))
        m_initgrp(mtmp, x, y, 3, mmflags);
    else if (!anymon && !(mmflags & C.MM_NOGRP) && (ptr.geno & C.G_LGROUP))
        m_initgrp(mtmp, x, y, 10, mmflags);

    // speed
    mtmp.mspeed = C.MSLOW;

    place_monster(mtmp, x, y);

    // Initial items
    if (allow_minvent) {
        // m_initweap(mtmp);
        // m_initinv(mtmp);
    }

    // peaceful
    mtmp.mpeaceful = hacklib.peace_minded(ptr) ? 1 : 0;

    return mtmp;
}

export function m_initgrp(mtmp, x, y, n, mmflags) {
    let mm = {x: 0, y: 0};
    let cnt = rnd(n);
    let mon;

    if (cnt === 0) return;

    if (mmflags & C.MM_ANGRY)
        mmflags &= ~C.MM_ANGRY;

    let gpflags = C.NO_MM_FLAGS;

    while (cnt--) {
        if (hacklib.peace_minded(mtmp.data)) continue;
        if (enexto_gpflags(mm, mtmp.mx, mtmp.my, mtmp.data, gpflags)) {
            mon = makemon(mtmp.data, mm.x, mm.y, (mmflags | C.MM_NOGRP));
            if (mon) {
                mon.mpeaceful = 0;
                mon.mavenge = 0;
                // set_malign(mon);
            }
        }
    }
}


export function newmonhp(mon, mndx) {
    let ptr = mons[mndx];
    let basehp = 0;

    mon.m_lev = adj_lev(ptr);
    if (mondata.is_golem(ptr)) {
        mon.mhpmax = mon.mhp = hacklib.golemhp(mndx);
    } else if (mondata.is_rider(ptr)) {
        basehp = 10;
        mon.mhpmax = mon.mhp = d(basehp, 8);
    } else if (ptr.mlevel > 49) {
        mon.mhpmax = mon.mhp = 2 * (ptr.mlevel - 6);
    } else if (ptr.mlet === C.S_DRAGON && mndx >= C.PM_GRAY_DRAGON) {
        basehp = mon.m_lev;
        mon.mhpmax = mon.mhp = hacklib.In_endgame(game.u.uz) ? (8 * basehp) : (4 * basehp + d(basehp, 4));
    } else if (!mon.m_lev) {
        basehp = 1;
        mon.mhpmax = mon.mhp = rnd(4);
    } else {
        basehp = mon.m_lev;
        mon.mhpmax = mon.mhp = d(basehp, 8);
        if (is_home_elemental(ptr))
            mon.mhpmax = (mon.mhp *= 3);
    }
}


export function adj_lev(ptr) {
    let tmp, tmp2;

    if (ptr === mons[C.PM_WIZARD_OF_YENDOR]) {
        tmp = ptr.mlevel + game.mvitals[C.PM_WIZARD_OF_YENDOR].died;
        if (tmp > 49) tmp = 49;
        return tmp;
    }

    if ((tmp = ptr.mlevel) > 49)
        return 50;

    tmp2 = (hacklib.level_difficulty() - tmp);
    if (tmp2 < 0)
        tmp--;
    else
        tmp += Math.floor(tmp2 / 5);

    tmp2 = (game.u.ulevel - ptr.mlevel);
    if (tmp2 > 0)
        tmp += Math.floor(tmp2 / 4);

    tmp2 = Math.floor((3 * ptr.mlevel) / 2);
    if (tmp2 > 49)
        tmp2 = 49;
    return ((tmp > tmp2) ? tmp2 : (tmp > 0 ? tmp : 0));
}


export function is_home_elemental(ptr) {
    if (ptr.mlet === C.S_ELEMENTAL) {
        switch (mondata.monsndx(ptr)) {
            case C.PM_AIR_ELEMENTAL:
                return hacklib.Is_airlevel(game.u.uz);
            case C.PM_FIRE_ELEMENTAL:
                return hacklib.Is_firelevel(game.u.uz);
            case C.PM_EARTH_ELEMENTAL:
                return hacklib.Is_earthlevel(game.u.uz);
            case C.PM_WATER_ELEMENTAL:
                return hacklib.Is_waterlevel(game.u.uz);
            default:
                break;
        }
    }
    return false;
}
