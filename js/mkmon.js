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
import { mons } from './monst.js';


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

export function u_at(x, y) {
    return game.u && game.u.ux === x && game.u.uy === y;
}

export function m_in_air(mon) {
    // stub
    return false;
}

export function likes_lava(ptr) {
    // stub
    return false;
}

export function passes_walls(ptr) {
    return (ptr.mflags1 & C.M1_WALLWALK) !== 0;
}

export function may_passwall(x, y) {
    // stub
    return false;
}

export function amorphous(ptr) {
    return (ptr.mflags1 & C.M1_AMORPHOUS) !== 0;
}

export function closed_door(x, y) {
    // stub
    return false;
}

export function onscary(x, y, mon) {
    // stub
    return false;
}

export function goodpos_onscary(x, y, mdat) {
    // stub
    return false;
}

export function accessible(x, y) {
    // C ACCESSIBLE macro
    return hacklib.ACCESSIBLE(game.level.locations[x][y].typ);
}

export function throws_rocks(ptr) {
    return (ptr.mflags2 & C.M2_ROCKTHROW) !== 0;
}

export function is_exclusion_zone(rtype, x, y) {
    // stub
    return false;
}

export function ZAP_POS(typ) {
    return typ >= C.POOL && typ <= C.IRONBARS;
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
        if (u_at(x, y) && mtmp !== game.youmonst
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
                        || (!hacklib.Is_waterlevel()
                            && !hacklib.is_waterwall(x, y)
                            && (hacklib.Levitation() || hacklib.Flying() || hacklib.Wwalking())));
            else
                return (mondata.is_swimmer(mdat)
                        || (!hacklib.Is_waterlevel()
                            && !hacklib.is_waterwall(x, y)
                            && m_in_air(mtmp)));
        } else if (mdat.mlet === C.S_EEL && rn2(13) && !ignorewater) {
            return false;
        } else if (hacklib.is_lava(x, y) && !ignorelava) {
            if (mdat === mons[C.PM_FLOATING_EYE])
                return false;
            else if (mtmp === game.youmonst)
                return (hacklib.Levitation() || hacklib.Flying()
                        || (hacklib.Fire_resistance() && hacklib.Wwalking() && game.u.uarmf
                            && game.u.uarmf.oerodeproof)
                        || (hacklib.Upolyd() && likes_lava(game.youmonst.data)));
            else
                return (m_in_air(mtmp) || likes_lava(mdat));
        }
        if (passes_walls(mdat) && may_passwall(x, y))
            return true;
        if (amorphous(mdat) && closed_door(x, y))
            return true;

        if (checkscary && (mtmp.m_id ? onscary(x, y, mtmp) : goodpos_onscary(x, y, mdat)))
            return false;
    }

    if (!accessible(x, y)) {
        if (!(hacklib.is_pool(x, y) && ignorewater)
            && !(hacklib.is_lava(x, y) && ignorelava))
            return false;
    }

    if (hacklib.sobj_at(C.BOULDER, x, y) && (!mdat || !throws_rocks(mdat)))
        return false;

    if (avoid_monpos && is_exclusion_zone(C.LR_MONGEN, x, y))
        return false;

    return true;
}

// C ref: teleport.c
export function collect_coords(ccc, cx, cy, maxradius, cc_flags, filter) {
    let x, y, lox, hix, loy, hiy;
    let radius, rowrange, colrange, k, n = 0;
    let cc;
    let newpass, passend;
    let include_cxcy = (cc_flags & C.CC_INCL_CENTER) !== 0;
    let scramble = (cc_flags & C.CC_UNSHUFFLED) === 0;
    let ring_pairs = (scramble && (cc_flags & C.CC_RING_PAIRS) !== 0);
    let skip_mons = (cc_flags & C.CC_SKIP_MONS) !== 0;
    let skip_inaccessible = (cc_flags & C.CC_SKIP_INACCS) !== 0;
    let result = 0;

    rowrange = (cy < Math.trunc(C.ROWNO / 2)) ? (C.ROWNO - 1 - cy) : cy;
    colrange = (cx < Math.trunc(C.COLNO / 2)) ? (C.COLNO - 1 - cx) : cx;
    k = Math.max(rowrange, colrange);

    if (!maxradius)
        maxradius = k;
    else
        maxradius = Math.min(maxradius, k);

    let passcc_idx = 0;
    let passcc_n = 0;

    for (radius = include_cxcy ? 0 : 1; radius <= maxradius; ++radius) {
        if (!ring_pairs) {
            newpass = passend = true;
        } else {
            newpass = ((radius % 2) !== 0 || radius === 0);
            passend = ((radius % 2) === 0 || radius === maxradius);
        }

        if (newpass || passcc_idx === -1) {
            passcc_idx = ccc.length;
            passcc_n = 0;
        }

        lox = cx - radius; hix = cx + radius;
        loy = cy - radius; hiy = cy + radius;

        for (y = Math.max(loy, 0); y <= hiy; ++y) {
            if (y > C.ROWNO - 1)
                break;
            for (x = Math.max(lox, 1); x <= hix; ++x) {
                if (x > C.COLNO - 1)
                    break;
                if (x !== lox && x !== hix && y !== loy && y !== hiy)
                    continue;
                if ((skip_mons && m_at(x, y))
                    || (skip_inaccessible && !ZAP_POS(game.level.locations[x][y].typ)))
                    continue;
                if (filter && !filter(x, y))
                    continue;

                ccc.push({x: x, y: y});
                ++passcc_n;
                ++result;
            }
        }
        if (scramble && passend) {
            let n_shuff = passcc_n;
            let current_idx = passcc_idx;
            while (n_shuff > 1) {
                k = rn2(n_shuff);
                if (k) {
                    let temp = ccc[current_idx];
                    ccc[current_idx] = ccc[current_idx + k];
                    ccc[current_idx + k] = temp;
                }
                ++current_idx;
                --n_shuff;
            }
            passcc_idx = -1;
        }
    }
    return result;
}

// C ref: teleport.c
export function enexto(cc, xx, yy, mdat) {
    return (enexto_core(cc, xx, yy, mdat, C.GP_CHECKSCARY)
            || enexto_core(cc, xx, yy, mdat, C.NO_MM_FLAGS));
}

// C ref: teleport.c
export function enexto_gpflags(cc, xx, yy, mdat, entflags) {
    return (enexto_core(cc, xx, yy, mdat, C.GP_CHECKSCARY | entflags)
            || enexto_core(cc, xx, yy, mdat, entflags));
}

// C ref: teleport.c
export function enexto_core(cc, xx, yy, mdat, entflags) {
    let candy = [];
    let i, nearcandyct, allcandyct;
    let fakemon = { data: null };
    let allow_xx_yy = ((entflags & C.GP_ALLOW_XY) !== 0);

    if (!mdat) {
        mdat = mons[game.u.umonster];
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

// C ref: makemon.c
export function m_initsgrp(mtmp, x, y, mmf) {
    m_initgrp(mtmp, x, y, 3, mmf);
}

// C ref: makemon.c
export function m_initlgrp(mtmp, x, y, mmf) {
    m_initgrp(mtmp, x, y, 10, mmf);
}

// C ref: makemon.c
export function m_initgrp(mtmp, x, y, n, mmflags) {
    let mm = {x: x, y: y};
    let cnt = hacklib.rnd(n);
    let mon;

    cnt = Math.trunc(cnt / ((game.u.ulevel < 3) ? 4 : (game.u.ulevel < 5) ? 2 : 1));
    if (!cnt) cnt++;

    while (cnt--) {
        if (peace_minded(mtmp.data))
            continue;

        if (enexto_gpflags(mm, mm.x, mm.y, mtmp.data, mmflags)) {
            mon = makemon(mtmp.data, mm.x, mm.y, (mmflags | C.MM_NOGRP));
            if (mon) {
                mon.mpeaceful = 0;
                mon.mavenge = 0;
                set_malign(mon);
            }
        }
    }
}

export function always_peaceful(ptr) {
    // stub
    return false;
}

export function always_hostile(ptr) {
    // stub
    return false;
}

export function race_peaceful(ptr) {
    // stub
    return false;
}

export function race_hostile(ptr) {
    // stub
    return false;
}

export function is_minion(ptr) {
    // stub
    return false;
}

// C ref: makemon.c
export function peace_minded(ptr) {
    let mal = ptr.maligntyp;
    let ual = game.u.ualign.type;

    if (always_peaceful(ptr))
        return true;
    if (always_hostile(ptr))
        return false;
    if (ptr.msound === C.MS_LEADER || ptr.msound === C.MS_GUARDIAN)
        return true;
    if (ptr.msound === C.MS_NEMESIS)
        return false;
    if (ptr === mons[C.PM_ERINYS])
        return !game.u.ualign.abuse;

    if (race_peaceful(ptr))
        return true;
    if (race_hostile(ptr))
        return false;

    if (Math.sign(mal) !== Math.sign(ual))
        return false;

    if (mal < C.A_NEUTRAL && game.u.uhave.amulet)
        return false;

    if (is_minion(ptr))
        return (game.u.ualign.record >= 0);

    return !!rn2(16 + (game.u.ualign.record < -15 ? -15 : game.u.ualign.record)) && !!rn2(2 + Math.abs(mal));
}

// C ref: makemon.c
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

    coaligned = (Math.sign(mal) === Math.sign(game.u.ualign.type));
    if (mtmp.data.msound === C.MS_LEADER) {
        mtmp.malign = -20;
    } else if (mal === C.A_NONE) {
        if (mtmp.mpeaceful)
            mtmp.malign = 0;
        else
            mtmp.malign = 20;
    } else if (always_peaceful(mtmp.data)) {
        let absmal = Math.abs(mal);
        if (mtmp.mpeaceful)
            mtmp.malign = -3 * Math.max(5, absmal);
        else
            mtmp.malign = 3 * Math.max(5, absmal);
    } else if (always_hostile(mtmp.data)) {
        let absmal = Math.abs(mal);
        if (coaligned)
            mtmp.malign = 0;
        else
            mtmp.malign = Math.max(5, absmal);
    } else if (coaligned) {
        let absmal = Math.abs(mal);
        if (mtmp.mpeaceful)
            mtmp.malign = -3 * Math.max(3, absmal);
        else
            mtmp.malign = Math.max(3, absmal);
    } else {
        mtmp.malign = Math.abs(mal);
    }
}

export function in_town(x, y) {
    // stub
    return false;
}

export function depth(uz) {
    // stub
    return 1;
}

export function get_shop_item(rt) {
    // stub
    return -1;
}

export function obfree(otmp, arg) {
    // stub
}

export const syms = [
    C.MAXOCLASSES,  C.MAXOCLASSES,     C.RING_CLASS,   C.WAND_CLASS,   C.WEAPON_CLASS,
    C.FOOD_CLASS,   C.COIN_CLASS,      C.SCROLL_CLASS, C.POTION_CLASS, C.ARMOR_CLASS,
    C.AMULET_CLASS, C.TOOL_CLASS,      C.ROCK_CLASS,   C.GEM_CLASS,    C.SPBOOK_CLASS,
    C.S_MIMIC_DEF,  C.S_MIMIC_DEF
];

export function ROLL_FROM(arr) {
    return arr[rn2(arr.length)];
}

// C ref: makemon.c
export function set_mimic_sym(mtmp) {
    let typ, roomno, rt;
    let appear, ap_type;
    let s_sym;
    let otmp;
    let mx, my;

    if (!mtmp || hacklib.Protection_from_shape_changers())
        return;
    mx = mtmp.mx;
    my = mtmp.my;
    typ = game.level.locations[mx][my].typ;

    roomno = game.level.locations[mx][my].roomno - C.ROOMOFFSET;
    if (roomno >= 0)
        rt = game.level.rooms[roomno].rtype;
    else
        rt = 0;

    if (hacklib.OBJ_AT(mx, my)) {
        ap_type = C.M_AP_OBJECT;
        appear = game.level.objects[mx][my].otyp; // NOTE: game.level.objects is a linked list in JS? No, it's 2D array of linked lists. Let's assume it has .otyp for now, wait it's a list head. Let's do game.level.objects[mx][my].otyp
    } else if (hacklib.IS_DOOR(typ) || hacklib.IS_WALL(typ) || typ === C.SDOOR || typ === C.SCORR) {
        ap_type = C.M_AP_FURNITURE;
        if (mx !== 0 && (game.level.locations[mx - 1][my].typ === C.HWALL
                        || game.level.locations[mx - 1][my].typ === C.TLCORNER
                        || game.level.locations[mx - 1][my].typ === C.TRWALL
                        || game.level.locations[mx - 1][my].typ === C.BLCORNER
                        || game.level.locations[mx - 1][my].typ === C.TDWALL
                        || game.level.locations[mx - 1][my].typ === C.CROSSWALL
                        || game.level.locations[mx - 1][my].typ === C.TUWALL))
            appear = C.Is_rogue_level() ? C.S_hwall : C.S_hcdoor;
        else
            appear = C.Is_rogue_level() ? C.S_vwall : C.S_vcdoor;
    } else if (game.level.flags.is_maze_lev
               && !(hacklib.In_mines() && in_town(game.u.ux, game.u.uy))
               && !hacklib.In_sokoban() && rn2(2)) {
        ap_type = C.M_AP_OBJECT;
        appear = C.STATUE;
    } else if (roomno < 0 && !hacklib.t_at(mx, my)) {
        ap_type = C.M_AP_OBJECT;
        appear = C.BOULDER;
    } else if (rt === C.ZOO || rt === C.VAULT) {
        ap_type = C.M_AP_OBJECT;
        appear = C.GOLD_PIECE;
    } else if (rt === C.DELPHI) {
        if (rn2(2)) {
            ap_type = C.M_AP_OBJECT;
            appear = C.STATUE;
        } else {
            ap_type = C.M_AP_FURNITURE;
            appear = C.S_fountain;
        }
    } else if (rt === C.TEMPLE) {
        ap_type = C.M_AP_FURNITURE;
        appear = C.S_altar;
    } else if (rt >= C.SHOPBASE) {
        if (rn2(10) >= depth(game.u.uz)) {
            s_sym = C.S_MIMIC_DEF;
        } else {
            s_sym = get_shop_item(rt - C.SHOPBASE);
            if (s_sym < 0) {
                ap_type = C.M_AP_OBJECT;
                appear = -s_sym;
            } else if (rt === C.FODDERSHOP && s_sym > C.MAXOCLASSES) {
                ap_type = C.M_AP_OBJECT;
                appear = rn2(2) ? C.LUMP_OF_ROYAL_JELLY : C.SLIME_MOLD;
            } else {
                if (s_sym === C.RANDOM_CLASS || s_sym >= C.MAXOCLASSES)
                    s_sym = syms[rn2(syms.length - 2) + 2];
            }
        }
    } else {
        s_sym = ROLL_FROM(syms);
    }

    // label assign_sym logic equivalent
    if (s_sym !== undefined && appear === undefined) {
        if (s_sym === C.MAXOCLASSES) {
            const furnsyms = [
                C.S_upstair, C.S_upstair, C.S_dnstair, C.S_dnstair,
                C.S_altar, C.S_grave, C.S_throne, C.S_sink
            ];
            ap_type = C.M_AP_FURNITURE;
            appear = ROLL_FROM(furnsyms);
        } else {
            ap_type = C.M_AP_OBJECT;
            if (s_sym === C.S_MIMIC_DEF) {
                appear = C.STRANGE_OBJECT;
            } else if (s_sym === C.COIN_CLASS) {
                appear = C.GOLD_PIECE;
            } else {
                // otmp = mkobj(s_sym, false);
                // appear = otmp.otyp;
                // obfree(otmp, null);
                appear = hacklib.mkobj_otyp(s_sym); // simplified since mkobj consumes RNG in C, wait mkobj DOES consume rng.
                // We will implement mkobj or stub it to consume the right RNG.
            }
        }
    }

    mtmp.m_ap_type = ap_type;
    mtmp.mappearance = appear;

    if (ap_type === C.M_AP_OBJECT
        && (appear === C.STATUE || appear === C.FIGURINE
            || appear === C.CORPSE || appear === C.EGG || appear === C.TIN)) {
        let mndx = rndmonnum();
        let nocorpse_ndx = ((game.mvitals[mndx].mvflags & C.G_NOCORPSE) !== 0);

        if (appear === C.CORPSE && nocorpse_ndx)
            mndx = rn1(C.PM_WIZARD - C.PM_ARCHEOLOGIST + 1, C.PM_ARCHEOLOGIST);
        else if ((appear === C.EGG && !mondata.can_be_hatched(mndx))
                 || (appear === C.TIN && nocorpse_ndx))
            mndx = C.NON_PM;

        mtmp.mextra = mtmp.mextra || {};
        mtmp.mextra.mcorpsenm = mndx;
    } else if (ap_type === C.M_AP_OBJECT && appear === C.SLIME_MOLD) {
        mtmp.mextra = mtmp.mextra || {};
        mtmp.mextra.mcorpsenm = game.context.current_fruit;
        game.level.flags.made_fruit = true;
    } else if (ap_type === C.M_AP_FURNITURE && appear === C.S_altar) {
        let algn = rn2(3) - 1;

        // Not used except for appearing logic.
        mtmp.mextra = mtmp.mextra || {};
        mtmp.mextra.mcorpsenm = algn;
    }
}

export function cansee(x, y) {
    // stub
    return false;
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
        good = (!game.gi.in_mklev && cansee(nx,ny)) ? false
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
                    if (bl === 0 && cansee(nx,ny))
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

export function propagate(mndx, countbirth, flag) {
    // stub
    return 0;
}

export function newegd(mtmp) {}
export function newepri(mtmp) {}
export function neweshk(mtmp) {}
export function newemin(mtmp) {}
export function newedog(mtmp) {}

export function mon_learns_traps(mtmp, trap_typ) {}
export function mon_set_minvis(mtmp, b) {}
export function hideunder(mtmp) {}

export function m_initweap(mtmp) {}
export function m_initinv(mtmp) {}
export function m_dowear(mtmp, b) {}

export function can_saddle(mtmp) { return false; }
export function which_armor(mtmp, w_type) { return null; }
export function put_saddle_on_mon(obj, mtmp) {}
export function deliver_obj_to_mon(mtmp, arg1, arg2) {}
export function newsym(x, y) {}
export function canseemon(mtmp) { return false; }
export function sensemon(mtmp) { return false; }
export function set_apparxy(mtmp) {}
export function emits_light(ptr) { return 0; }
export function new_light_source(x, y, ct, ls_type, any) {}
export function monst_to_any(mtmp) { return null; }
export function pm_to_cham(mndx) { return C.NON_PM; }
export function newcham(mtmp, ptr, nc_flags) { return false; }
export function christen_monst(mtmp, name) { return mtmp; }
export function rndghostname() { return "ghost"; }
export function mongets(mtmp, otyp) { return null; }
export function get_wormno() { return 0; }
export function initworm(mtmp, arg) {}
export function count_wsegs(mtmp) { return 0; }
export function place_worm_tail_randomly(mtmp, x, y) {}
export function discard_minvent(mtmp, b) {}
export function dochugw(mtmp, b) {}

// C ref: makemon.c
export function newmonhp(mon, mndx) {
    let ptr = mons[mndx];
    let basehp = 0;

    mon.m_lev = hacklib.adj_lev(ptr);
    if (mondata.is_golem(ptr)) {
        mon.mhpmax = mon.mhp = 10; // golemhp(mndx);
    } else if (mondata.is_rider(ptr)) {
        basehp = 10;
        mon.mhpmax = mon.mhp = hacklib.d(basehp, 8);
    } else if (ptr.mlevel > 49) {
        mon.mhpmax = mon.mhp = 2 * (ptr.mlevel - 6);
        mon.m_lev = Math.trunc(mon.mhp / 4);
    } else if (ptr.mlet === C.S_DRAGON && mndx >= C.PM_GRAY_DRAGON) {
        basehp = mon.m_lev;
        mon.mhpmax = mon.mhp = hacklib.In_endgame(game.u.uz) ? (8 * basehp)
                                 : (4 * basehp + hacklib.d(basehp, 4));
    } else if (!mon.m_lev) {
        basehp = 1;
        mon.mhpmax = mon.mhp = hacklib.rnd(4);
    } else {
        basehp = mon.m_lev;
        mon.mhpmax = mon.mhp = hacklib.d(basehp, 8);
        if (is_home_elemental(ptr))
            mon.mhpmax = (mon.mhp *= 3);
    }

    if (mon.mhpmax === basehp) {
        mon.mhpmax += 1;
        mon.mhp = mon.mhpmax;
    }
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

// C ref: makemon.c
export function makemon(ptr, x, y, mmflags) {
    let mtmp;
    let fakemon = { data: null };
    let cc = {x: 0, y: 0};
    let mndx, mcham, ct, mitem;
    let femaleok, maleok;
    let anymon = !ptr;
    let byyou = u_at(x, y);
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
        if (game.wizard && (game.mvitals[mndx].mvflags & C.G_EXTINCT)) {
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
                 && ((tryct === 1 && throws_rocks(ptr) && hacklib.In_sokoban())
                     || !goodpos(x, y, fakemon, gpflags)));
        mndx = mondata.monsndx(ptr);
    }

    propagate(mndx, countbirth, false);
    mtmp = newmonst();

    if (mmflags & C.MM_EGD)
        newegd(mtmp);
    if (mmflags & C.MM_EPRI)
        newepri(mtmp);
    if (mmflags & C.MM_ESHK)
        neweshk(mtmp);
    if (mmflags & C.MM_EMIN)
        newemin(mtmp);
    if (mmflags & C.MM_EDOG)
        newedog(mtmp);
    if (mmflags & C.MM_ASLEEP)
        mtmp.msleeping = 1;

    // In JS we can append to game.level.monsters list? newmonst handles some, but C does:
    // mtmp->nmon = fmon; fmon = mtmp;
    // We assume game state keeps track of monsters in a list or similar if needed. For now we just return.

    // mtmp.m_id = next_ident(); // already done in newmonst()

    mtmp.data = ptr;
    if (ptr.msound === C.MS_LEADER && hacklib.quest_info(C.MS_LEADER) === mndx)
        game.svq.quest_status.leader_m_id = mtmp.m_id;
    mtmp.mnum = mndx;

    newmonhp(mtmp, mndx);

    femaleok = (!mondata.is_male(ptr) && !mondata.is_neuter(ptr));
    maleok = (!mondata.is_female(ptr) && !mondata.is_neuter(ptr));
    if (mondata.is_female(ptr) || ((mmflags & C.MM_FEMALE) !== 0 && femaleok))
        mtmp.female = 1;
    else if (mondata.is_male(ptr) || ((mmflags & C.MM_MALE) !== 0 && maleok))
        mtmp.female = 0;
    else if (ptr.msound === C.MS_LEADER && hacklib.quest_info(C.MS_LEADER) === mndx)
        mtmp.female = game.svq.quest_status.ldrgend;
    else if (ptr.msound === C.MS_NEMESIS && hacklib.quest_info(C.MS_NEMESIS) === mndx)
        mtmp.female = game.svq.quest_status.nemgend;
    else
        mtmp.female = femaleok ? rn2(2) : 0;

    if (hacklib.In_sokoban() && !mondata.mindless(ptr)) {
        mon_learns_traps(mtmp, C.PIT);
        mon_learns_traps(mtmp, C.HOLE);
    }
    if (hacklib.Is_stronghold() && !mondata.mindless(ptr))
        mon_learns_traps(mtmp, C.TRAPDOOR);
    if (ptr.msound === C.MS_LEADER || ptr.msound === C.MS_NEMESIS)
        mon_learns_traps(mtmp, C.ALL_TRAPS);

    if (hacklib.Is_stronghold() || hacklib.Is_knox() || hacklib.In_endgame() ||
        hacklib.In_hell() || hacklib.In_V_tower() || hacklib.In_quest())
        mtmp.mwandexp = 1;

    place_monster(mtmp, x, y);
    mtmp.mcansee = mtmp.mcanmove = 1;
    mtmp.mgenmklev = game.gi.in_mklev ? 1 : 0;
    mtmp.seen_resistance = C.M_SEEN_NOTHING;
    mtmp.mpeaceful = (mmflags & C.MM_ANGRY) ? 0 : peace_minded(ptr);

    if ((mmflags & C.MM_MINVIS) !== 0)
        mon_set_minvis(mtmp, false);

    switch (ptr.mlet) {
    case C.S_MIMIC:
        set_mimic_sym(mtmp);
        break;
    case C.S_SPIDER:
    case C.S_SNAKE:
        if (game.gi.in_mklev) {
            if (x && y)
                hacklib.mkobj_at(C.RANDOM_CLASS, x, y, true);
            hideunder(mtmp);
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
        if (game.gi.in_mklev) {
            hideunder(mtmp);
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

    ct = emits_light(mtmp.data);
    if (ct > 0)
        new_light_source(mtmp.mx, mtmp.my, ct, C.LS_MONSTER, monst_to_any(mtmp));

    mitem = C.STRANGE_OBJECT;

    if (mndx === C.PM_VLAD_THE_IMPALER)
        mitem = C.CANDELABRUM_OF_INVOCATION;
    mtmp.cham = C.NON_PM;

    if (!hacklib.Protection_from_shape_changers()
        && (mcham = pm_to_cham(mndx)) !== C.NON_PM) {
        mtmp.cham = mcham;
        if (mndx !== C.PM_VLAD_THE_IMPALER
            && newcham(mtmp, null, C.NO_NC_FLAGS))
            allow_minvent = false;
    } else if (mndx === C.PM_WIZARD_OF_YENDOR) {
        mtmp.iswiz = 1;
        game.context.no_of_wizards++;
        if (game.context.no_of_wizards === 1 && hacklib.Is_earthlevel())
            mitem = C.SPE_DIG;
    } else if (mndx === C.PM_GHOST && !(mmflags & C.MM_NONAME)) {
        mtmp = christen_monst(mtmp, rndghostname());
    } else if (mndx === C.PM_CROESUS) {
        mitem = C.TWO_HANDED_SWORD;
    } else if (ptr.msound === C.MS_NEMESIS) {
        mitem = C.BELL_OF_OPENING;
    } else if (mndx === C.PM_PESTILENCE) {
        mitem = C.POT_SICKNESS;
    }
    if (mitem !== C.STRANGE_OBJECT && allow_minvent)
        mongets(mtmp, mitem);

    if (game.gi.in_mklev) {
        if ((mondata.is_ndemon(ptr) || mndx === C.PM_WUMPUS
             || mndx === C.PM_LONG_WORM || mndx === C.PM_GIANT_EEL)
            && !game.u.uhave.amulet && rn2(5))
            mtmp.msleeping = 1;
    } else {
        if (byyou) {
            newsym(mtmp.mx, mtmp.my);
            set_apparxy(mtmp);
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
    if (mndx === C.PM_LONG_WORM && (mtmp.wormno = get_wormno()) !== 0) {
        initworm(mtmp, allowtail ? rn2(5) : 0);
        if (count_wsegs(mtmp))
            place_worm_tail_randomly(mtmp, x, y);
    }

    if ((mndx === C.PM_ALIGNED_CLERIC || mndx === C.PM_HIGH_CLERIC)
            ? !(mmflags & (C.MM_EPRI | C.MM_EMIN))
            : (mndx === C.PM_ANGEL && !(mmflags & C.MM_EMIN) && !rn2(3))) {
        newemin(mtmp);
        mtmp.mextra = mtmp.mextra || {};
        mtmp.mextra.emin = mtmp.mextra.emin || {};
        let eminp = mtmp.mextra.emin;

        mtmp.isminion = 1;
        eminp.min_align = rn2(3) - 1;
        eminp.renegade = ((mmflags & C.MM_ANGRY) ? 1 : !rn2(3));
        mtmp.mpeaceful = (eminp.min_align === game.u.ualign.type)
                              ? !eminp.renegade
                              : eminp.renegade;
    }
    set_malign(mtmp);
    if (anymon && !(mmflags & C.MM_NOGRP)) {
        if ((ptr.geno & C.G_SGROUP) && rn2(2)) {
            m_initsgrp(mtmp, mtmp.mx, mtmp.my, mmflags);
        } else if (ptr.geno & C.G_LGROUP) {
            if (rn2(3))
                m_initlgrp(mtmp, mtmp.mx, mtmp.my, mmflags);
            else
                m_initsgrp(mtmp, mtmp.mx, mtmp.my, mmflags);
        }
    }

    if (allow_minvent) {
        if (mondata.is_armed(ptr))
            m_initweap(mtmp);
        m_initinv(mtmp);
        m_dowear(mtmp, true);

        if (!rn2(100) && mondata.is_domestic(ptr)
            && can_saddle(mtmp) && !which_armor(mtmp, C.W_SADDLE)) {
            put_saddle_on_mon(null, mtmp);
        }

    } else {
        if (mtmp.minvent)
            discard_minvent(mtmp, true);
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

    if (allow_minvent && game.gm.migrating_objs)
        deliver_obj_to_mon(mtmp, 1, C.DF_NONE);

    if (!game.gi.in_mklev) {
        newsym(mtmp.mx, mtmp.my);
        if (!(mmflags & C.MM_NOMSG)) {
            // JS message skipping
        }
        if (game.go.occupation)
            dochugw(mtmp, false);
    }

    return mtmp;
}
