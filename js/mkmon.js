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

export function goodpos_onscary(x, y, mptr) {
    if (mptr.mlet === C.S_HUMAN || mptr.mlet === C.S_ANGEL
        || mondata.is_rider(mptr) || mondata.unique_corpstat(mptr))
        return false;

    if (C.IS_ALTAR(game.level.locations[x][y].typ) && mptr.mlet === C.S_VAMPIRE)
        return true;

    // scare monster scroll doesn't have any of the below restrictions,
    // being its own source of power
    if (hacklib.sobj_at(C.SCR_SCARE_MONSTER, x, y))
        return true;

    // engraved Elbereth doesn't work in Gehennom or the end-game
    if (hacklib.Inhell() || C.In_endgame())
        return false;

    // creatures who don't (or can't) fear a written Elbereth and weren't
    // caught by the minions check
    if (mptr === C.mons[C.PM_MINOTAUR] || !mondata.haseyes(mptr))
        return false;

    return hacklib.sengr_at("Elbereth", x, y, true) ? true : false;
}

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
        if (hacklib.u_at(x, y) && mtmp !== game.youmonst
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
                return (hacklib.Swimming() || hacklib.Amphibious()
                        || (!hacklib.Is_waterlevel(game.u.uz)
                            && !hacklib.is_waterwall(x, y)
                            && (hacklib.Levitation() || hacklib.Flying() || hacklib.Wwalking())));
            else
                return (mondata.is_swimmer(mdat)
                        || (!hacklib.Is_waterlevel(game.u.uz)
                            && !hacklib.is_waterwall(x, y)
                            && hacklib.m_in_air(mtmp)));
        } else if (mdat.mlet === C.S_EEL && rn2(13) && !ignorewater) {
            return false;
        } else if (hacklib.is_lava(x, y) && !ignorelava) {
            if (mdat === C.mons[C.PM_FLOATING_EYE])
                return false;
            else if (mtmp === game.youmonst)
                return (hacklib.Levitation() || hacklib.Flying()
                        || (hacklib.Fire_resistance() && hacklib.Wwalking() && game.uarmf
                            && game.uarmf.oerodeproof)
                        || (hacklib.Upolyd() && mondata.likes_lava(game.youmonst.data)));
            else
                return (hacklib.m_in_air(mtmp) || mondata.likes_lava(mdat));
        }
        if (mondata.passes_walls(mdat) && hacklib.may_passwall(x, y))
            return true;
        if (mondata.amorphous(mdat) && hacklib.closed_door(x, y))
            return true;
        if (checkscary && (mtmp.m_id ? hacklib.onscary(x, y, mtmp)
                                      : goodpos_onscary(x, y, mdat)))
            return false;
    }
    if (!hacklib.accessible(x, y)) {
        if (!(hacklib.is_pool(x, y) && ignorewater)
            && !(hacklib.is_lava(x, y) && ignorelava))
            return false;
    }
    if (hacklib.sobj_at(C.BOULDER, x, y) && (!mdat || !mondata.throws_rocks(mdat)))
        return false;
    if (avoid_monpos && hacklib.is_exclusion_zone(C.LR_MONGEN, x, y))
        return false;

    return true;
}

export function enexto(cc, xx, yy, mdat) {
    return (enexto_core(cc, xx, yy, mdat, C.GP_CHECKSCARY)
            || enexto_core(cc, xx, yy, mdat, C.NO_MM_FLAGS));
}

export function enexto_gpflags(cc, xx, yy, mdat, entflags) {
    return (enexto_core(cc, xx, yy, mdat, C.GP_CHECKSCARY | entflags)
            || enexto_core(cc, xx, yy, mdat, entflags));
}

export function enexto_core(cc, xx, yy, mdat, entflags) {
    let candy = []; // Will hold coordinate objects {x, y}
    let i, nearcandyct, allcandyct;
    let fakemon = { m_id: 0, data: null };
    let allow_xx_yy = ((entflags & C.GP_ALLOW_XY) !== 0);

    if (!mdat) {
        mdat = C.mons[game.u.umonster];
    }

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

    cc.x = xx;
    cc.y = yy;
    if (allow_xx_yy && goodpos(cc.x, cc.y, fakemon, entflags))
        return true;

    return false;
}

export function collect_coords(ccc, cx, cy, maxradius, cc_flags, filter) {
    let x, y, lox, hix, loy, hiy;
    let radius, rowrange, colrange, k, n = 0;
    let passcc = 0; // Index into ccc
    let newpass, passend;
    let include_cxcy = ((cc_flags & C.CC_INCL_CENTER) !== 0);
    let scramble = ((cc_flags & C.CC_UNSHUFFLED) === 0);
    let ring_pairs = (scramble && ((cc_flags & C.CC_RING_PAIRS) !== 0));
    let skip_mons = ((cc_flags & C.CC_SKIP_MONS) !== 0);
    let skip_inaccessible = ((cc_flags & C.CC_SKIP_INACCS) !== 0);
    let result = 0;

    rowrange = (cy < C.ROWNO / 2) ? (C.ROWNO - 1 - cy) : cy;
    colrange = (cx < C.COLNO / 2) ? (C.COLNO - 1 - cx) : cx;
    k = Math.max(rowrange, colrange);

    if (!maxradius)
        maxradius = k;
    else
        maxradius = Math.min(maxradius, k);

    for (radius = include_cxcy ? 0 : 1; radius <= maxradius; ++radius) {
        if (!ring_pairs) {
            newpass = passend = true;
        } else {
            newpass = ((radius % 2) !== 0 || radius === 0);
            passend = ((radius % 2) === 0 || radius === maxradius);
        }

        if (newpass || passcc === -1) {
            passcc = result;
            n = 0;
        }

        lox = cx - radius;
        hix = cx + radius;
        loy = cy - radius;
        hiy = cy + radius;

        for (y = Math.max(loy, 0); y <= hiy; ++y) {
            if (y > C.ROWNO - 1)
                break;
            for (x = Math.max(lox, 1); x <= hix; ++x) {
                if (x > C.COLNO - 1)
                    break;
                if (x !== lox && x !== hix && y !== loy && y !== hiy)
                    continue;
                if ((skip_mons && m_at(x, y))
                    || (skip_inaccessible && !C.ZAP_POS(game.level.locations[x][y].typ)))
                    continue;
                if (filter && !filter(x, y))
                    continue;

                ccc.push({x: x, y: y});
                ++n;
                ++result;
            }
        }

        if (scramble && passend) {
            while (n > 1) {
                k = rn2(n);
                if (k) {
                    let temp = ccc[passcc];
                    ccc[passcc] = ccc[passcc + k];
                    ccc[passcc + k] = temp;
                }
                ++passcc;
                --n;
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
        nx = hacklib.rn1(C.COLNO - 3, 2);
        ny = rn2(C.ROWNO);
        good = (!game.gi.in_mklev && hacklib.cansee(nx,ny)) ? false
                                              : goodpos(nx, ny, mon, gpflags);
    } while ((++tryct < 50) && !good);

    if (!good) {
        let xofs = nx;
        let yofs = ny;
        let dx, dy;
        let bl = (game.gi.in_mklev || hacklib.Blind()) ? 1 : 0;

        for ( ; bl < 2; bl++) {
            if (!bl)
                gpflags &= ~C.GP_CHECKSCARY;
            for (dx = 0; dx < C.COLNO; dx++)
                for (dy = 0; dy < C.ROWNO; dy++) {
                    nx = ((dx + xofs) % (C.COLNO - 1)) + 1;
                    ny = ((dy + yofs) % (C.ROWNO - 1)) + 1;
                    if (bl === 0 && hacklib.cansee(nx,ny))
                        continue;
                    if (goodpos(nx, ny, mon, gpflags)) {
                        cc.x = nx;
                        cc.y = ny;
                        return true;
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

export function makemon(ptr, x, y, mmflags) {
    let mtmp;
    let fakemon = { m_id: 0, data: null };
    let cc = {x: 0, y: 0};
    let mndx, mcham, ct, mitem;
    let femaleok, maleok,
            anymon = !ptr,
            byyou = hacklib.u_at(x, y),
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
        // wizard and extinct check would go here
    } else {
        let tryct = 0;
        do {
            ptr = rndmonst();
            if (!ptr) {
                return null;
            }
            fakemon.data = ptr;
        } while (++tryct <= 50
                 && ((tryct === 1 && mondata.throws_rocks(ptr) && hacklib.In_sokoban(game.u.uz))
                     || !goodpos(x, y, fakemon, gpflags)));
        mndx = mondata.monsndx(ptr);
    }

    propagate(mndx, countbirth, false);
    mtmp = newmonst();

    // Some flag handling omitted for now as we port more stuff...
    if (mmflags & C.MM_ASLEEP)
        mtmp.msleeping = 1;

    mtmp.nmon = game.fmon;
    game.fmon = mtmp;
    mtmp.data = ptr;
    mtmp.mnum = mndx;

    newmonhp(mtmp, mndx);

    femaleok = (!mondata.is_male(ptr) && !mondata.is_neuter(ptr));
    maleok = (!mondata.is_female(ptr) && !mondata.is_neuter(ptr));
    if (mondata.is_female(ptr) || ((mmflags & C.MM_FEMALE) !== 0 && femaleok))
        mtmp.female = 1;
    else if (mondata.is_male(ptr) || ((mmflags & C.MM_MALE) !== 0 && maleok))
        mtmp.female = 0;
    else
        mtmp.female = femaleok ? rn2(2) : 0;

    place_monster(mtmp, x, y);
    mtmp.mcansee = mtmp.mcanmove = true;
    mtmp.mgenmklev = game.gi.in_mklev;
    mtmp.seen_resistance = C.M_SEEN_NOTHING;
    mtmp.mpeaceful = (mmflags & C.MM_ANGRY) ? false : peace_minded(ptr);
    set_malign(mtmp);
    return mtmp;
}

export function mbirth_limit(mndx) {
    return (mndx === C.PM_NAZGUL ? 9 : mndx === C.PM_ERINYS ? 3 : C.MAXMONNO);
}

export function propagate(mndx, tally, ghostly) {
    let gone = ((game.mvitals[mndx].mvflags & C.G_GONE) !== 0);
    let lim = mbirth_limit(mndx);
    let result = (game.mvitals[mndx].born < lim && !gone) ? true : false;

    if ((C.mons[mndx].geno & C.G_UNIQ) !== 0 && mndx !== C.PM_HIGH_CLERIC)
        game.mvitals[mndx].mvflags |= C.G_EXTINCT;

    if (game.mvitals[mndx].born < 255 && tally && (!ghostly || result))
        game.mvitals[mndx].born++;

    if (game.mvitals[mndx].born >= lim
        && !(C.mons[mndx].geno & C.G_NOGEN)
        && !(game.mvitals[mndx].mvflags & C.G_EXTINCT)) {
        game.mvitals[mndx].mvflags |= C.G_EXTINCT;
    }
    return result;
}

export function newmonhp(mon, mndx) {
    let ptr = C.mons[mndx];
    let basehp = 0;

    mon.m_lev = mondata.adj_lev(ptr);
    if (mondata.is_golem(ptr)) {
        // Need to port golemhp... for now, assuming 0/undefined as not needed right away... stubbing if needed
        mon.mhpmax = mon.mhp = 10; // TODO: golemhp(mndx)
    } else if (mondata.is_rider(ptr)) {
        basehp = 10;
        mon.mhpmax = mon.mhp = hacklib.d(basehp, 8);
    } else if (ptr.mlevel > 49) {
        mon.mhpmax = mon.mhp = 2 * (ptr.mlevel - 6);
        mon.m_lev = Math.floor(mon.mhp / 4);
    } else if (ptr.mlet === C.S_DRAGON && mndx >= C.PM_GRAY_DRAGON) {
        basehp = mon.m_lev;
        mon.mhpmax = mon.mhp = C.In_endgame() ? (8 * basehp)
                                 : (4 * basehp + hacklib.d(basehp, 4));
    } else if (!mon.m_lev) {
        basehp = 1;
        mon.mhpmax = mon.mhp = hacklib.rnd(4);
    } else {
        basehp = mon.m_lev;
        mon.mhpmax = mon.mhp = hacklib.d(basehp, 8);
        // if (is_home_elemental(ptr))
        //    mon.mhpmax = (mon.mhp *= 3);
    }

    if (mon.mhpmax === basehp) {
        mon.mhpmax += 1;
        mon.mhp = mon.mhpmax;
    }
}

export function peace_minded(ptr) {
    let mal = ptr.maligntyp, ual = game.u.ualign.type;

    if (mondata.always_peaceful(ptr))
        return true;
    if (mondata.always_hostile(ptr))
        return false;
    if (ptr.msound === C.MS_LEADER || ptr.msound === C.MS_GUARDIAN)
        return true;
    if (ptr.msound === C.MS_NEMESIS)
        return false;
    if (ptr === C.mons[C.PM_ERINYS])
        return !game.u.ualign.abuse;

    if (mondata.race_peaceful(ptr))
        return true;
    if (mondata.race_hostile(ptr))
        return false;

    // the monster is hostile if its alignment is different from the player's
    if (hacklib.sgn(mal) !== hacklib.sgn(ual))
        return false;

    // Co-aligned monsters are peaceful if they are intelligent and not hungry
    // but not for orcs/elves/etc since we handled races above
    return (ptr.mlevel > 3 && ptr.mlet !== C.S_ORC && ptr.mlet !== C.S_PUDDING
            && ptr.mlet !== C.S_BAT && ptr.mlet !== C.S_MIMIC
            && ptr.mlet !== C.S_FUNGUS && ptr.mlet !== C.S_RODENT
            && ptr.mlet !== C.S_SPIDER && ptr.mlet !== C.S_WORM);
}

export function set_malign(mtmp) {
    let mal = mtmp.data.maligntyp;
    let coaligned;

    if (mtmp.ispriest || mtmp.isminion) {
        if (mtmp.ispriest && mtmp.mextra && mtmp.mextra.epri)
            mal = mtmp.mextra.epri.shralign;
        else if (mtmp.isminion && mtmp.mextra && mtmp.mextra.emin)
            mal = mtmp.mextra.emin.min_align;

        if (mal !== C.A_NONE)
            mal *= 5;
    }

    coaligned = (hacklib.sgn(mal) === hacklib.sgn(game.u.ualign.type));
    if (mtmp.data.msound === C.MS_LEADER) {
        mtmp.malign = -20;
    } else if (mal === C.A_NONE) {
        if (mtmp.mpeaceful)
            mtmp.malign = 0;
        else
            mtmp.malign = 20;
    } else if (coaligned) {
        if (mtmp.mpeaceful)
            mtmp.malign = -30 + rn2(10);
        else
            mtmp.malign = 20;
    } else {
        if (mtmp.mpeaceful)
            mtmp.malign = 0;
        else
            mtmp.malign = 20;
    }
}
