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

    if (hacklib.IS_ALTAR(game.level.locations[x][y].typ) && mptr.mlet === C.S_VAMPIRE)
        return true;

    if (hacklib.sobj_at(C.SCR_SCARE_MONSTER, x, y))
        return true;

    if (hacklib.Inhell() || C.In_endgame())
        return false;

    if (mptr === mons[C.PM_MINOTAUR] || !mondata.haseyes(mptr))
        return false;

    let ep = hacklib.sengr_at("Elbereth", x, y, true);
    if (ep &&
        (hacklib.u_at(x, y)
         || (game.u.uprops[C.DISPLACED].extrinsic && game.u.ux === x && game.u.uy === y) // Displaced is actually a flag, approximated here
         || (ep.guardobjects && hacklib.vobj_at(x, y))))
        return true;

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
        if (hacklib.u_at(x, y) && mtmp !== game.gy.youmonst
            && (mtmp !== game.u.ustuck || !game.u.uswallow)
            && (!game.u.usteed || mtmp !== game.u.usteed))
            return false;
    }

    if (hacklib.MON_AT(x, y) && avoid_monpos)
        return false;

    if (mtmp) {
        let mtmp2 = m_at(x, y);

        if (mtmp2 && (mtmp2 !== mtmp || mtmp.wormno))
            return false;

        mdat = mtmp.data;
        if (hacklib.is_pool(x, y) && !ignorewater) {
            if (mtmp === game.gy.youmonst)
                return (hacklib.Swimming() || hacklib.Amphibious()
                        || (!C.Is_waterlevel()
                            && !hacklib.is_waterwall(x, y)
                            && (hacklib.Levitation() || hacklib.Flying() || hacklib.Wwalking())));
            else
                return (mondata.is_swimmer(mdat)
                        || (!C.Is_waterlevel()
                            && !hacklib.is_waterwall(x, y)
                            && hacklib.m_in_air(mtmp)));
        } else if (mdat.mlet === C.S_EEL && rn2(13) && !ignorewater) {
            return false;
        } else if (hacklib.is_lava(x, y) && !ignorelava) {
            if (mdat === mons[C.PM_FLOATING_EYE])
                return false;
            else if (mtmp === game.gy.youmonst)
                return (hacklib.Levitation() || hacklib.Flying()
                        || (hacklib.Fire_resistance() && hacklib.Wwalking() && game.u.uarmf
                            && game.u.uarmf.oerodeproof)
                        || (hacklib.Upolyd() && mondata.likes_lava(game.gy.youmonst.data)));
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
            || enexto_core(cc, xx, yy, mdat, 0));
}

export function enexto_core(cc, xx, yy, mdat, entflags) {
    let candy = [];
    let allow_xx_yy = (entflags & C.GP_ALLOW_XY) !== 0;

    if (!mdat) {
        mdat = mons[game.u.umonster];
    }
    let fakemon = newmonst();
    fakemon.data = mdat;

    let nearcandyct = hacklib.collect_coords(candy, xx, yy, 3, C.CC_NO_FLAGS, null);
    for (let i = 0; i < nearcandyct; ++i) {
        cc.x = candy[i].x;
        cc.y = candy[i].y;
        if (goodpos(cc.x, cc.y, fakemon, entflags))
            return true;
    }

    let allcandyct = hacklib.collect_coords(candy, xx, yy, 0, C.CC_NO_FLAGS, null);
    for (let i = nearcandyct; i < allcandyct; ++i) {
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

export function golemhp(type) {
    switch (type) {
    case C.PM_STRAW_GOLEM: return 20;
    case C.PM_PAPER_GOLEM: return 20;
    case C.PM_ROPE_GOLEM: return 30;
    case C.PM_LEATHER_GOLEM: return 40;
    case C.PM_GOLD_GOLEM: return 60;
    case C.PM_WOOD_GOLEM: return 50;
    case C.PM_FLESH_GOLEM: return 40;
    case C.PM_CLAY_GOLEM: return 70;
    case C.PM_STONE_GOLEM: return 100;
    case C.PM_GLASS_GOLEM: return 80;
    case C.PM_IRON_GOLEM: return 120;
    default: return 0;
    }
}

export function adj_lev(ptr) {
    let tmp, tmp2;

    if (ptr === mons[C.PM_WIZARD_OF_YENDOR]) {
        tmp = ptr.mlevel + game.mvitals[C.PM_WIZARD_OF_YENDOR].died;
        if (tmp > 49) tmp = 49;
        return tmp;
    }

    if ((tmp = ptr.mlevel) > 49) return 50;
    tmp2 = hacklib.level_difficulty() - tmp;
    if (tmp2 < 0) tmp--;
    else tmp += Math.trunc(tmp2 / 5);

    tmp2 = Math.trunc((game.u.ulevel) / 2);
    if (tmp2 > 0 && tmp2 < tmp) tmp = tmp2;

    if (tmp > 49) tmp = 49;

    if (ptr.mlet === C.S_DRAGON && monsndx(ptr) >= C.PM_GRAY_DRAGON) {
        let tmp3 = Math.trunc((game.u.ulevel) / 2);
        if (tmp3 > 0 && tmp3 > tmp) tmp = tmp3;
    }
    return tmp;
}

import { d } from './rng.js';

export function monhp_per_lvl(mon) {
    let ptr = mon.data;
    let hp = rnd(8);

    if (mondata.is_golem(ptr)) {
        hp = Math.trunc(golemhp(mondata.monsndx(ptr)) / ptr.mlevel);
    } else if (ptr.mlevel > 49) {
        hp = 4 + rnd(4);
    } else if (ptr.mlet === C.S_DRAGON && mondata.monsndx(ptr) >= C.PM_GRAY_DRAGON) {
        hp = 4 + rn2(5);
    } else if (!mon.m_lev) {
        hp = rnd(4);
    }
    return hp;
}

export function newmonhp(mon, mndx) {
    let ptr = mons[mndx];
    let basehp = 0;

    mon.m_lev = adj_lev(ptr);
    if (mondata.is_golem(ptr)) {
        mon.mhpmax = mon.mhp = golemhp(mndx);
    } else if (mondata.is_rider(ptr)) {
        basehp = 10;
        mon.mhpmax = mon.mhp = d(basehp, 8);
    } else if (ptr.mlevel > 49) {
        mon.mhpmax = mon.mhp = 2 * (ptr.mlevel - 6);
        mon.m_lev = Math.trunc(mon.mhp / 4);
    } else if (ptr.mlet === C.S_DRAGON && mndx >= C.PM_GRAY_DRAGON) {
        basehp = mon.m_lev;
        mon.mhpmax = mon.mhp = C.In_endgame() ? (8 * basehp) : (4 * basehp + d(basehp, 4));
    } else if (!mon.m_lev) {
        basehp = 1;
        mon.mhpmax = mon.mhp = rnd(4);
    } else {
        basehp = mon.m_lev;
        mon.mhpmax = mon.mhp = d(basehp, 8);
        if (mondata.is_home_elemental(ptr))
            mon.mhpmax = (mon.mhp *= 3);
    }

    if (mon.mhpmax === basehp) {
        mon.mhpmax += 1;
        mon.mhp = mon.mhpmax;
    }
}

export function peace_minded(ptr) {
    let mal = ptr.maligntyp;
    let ual = game.u.ualign.type;

    if (mondata.always_peaceful(ptr)) return true;
    if (mondata.always_hostile(ptr)) return false;
    if (ptr.msound === C.MS_LEADER || ptr.msound === C.MS_GUARDIAN) return true;
    if (ptr.msound === C.MS_NEMESIS) return false;
    if (ptr === mons[C.PM_ERINYS]) return !game.u.ualign.abuse;

    if (mondata.race_peaceful(ptr)) return true;
    if (mondata.race_hostile(ptr)) return false;

    if (Math.sign(mal) !== Math.sign(ual)) return false;

    if (mal < C.A_NEUTRAL && game.u.uhave.amulet) return false;

    if (mondata.is_minion(ptr))
        return game.u.ualign.record >= 0;

    return !!rn2(16 + (game.u.ualign.record < -15 ? -15 : game.u.ualign.record)) && !!rn2(2 + Math.abs(mal));
}

export function set_malign(mtmp) {
    let mal = mtmp.data.maligntyp;
    let coaligned;

    if (mtmp.ispriest || mtmp.isminion) {
        if (mtmp.ispriest && mtmp.mextra?.epri)
            mal = mtmp.mextra.epri.shralign;
        else if (mtmp.isminion && mtmp.mextra?.emin)
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
    } else if (mondata.always_peaceful(mtmp.data)) {
        let absmal = Math.abs(mal);
        if (mtmp.mpeaceful)
            mtmp.malign = -3 * Math.max(5, absmal);
        else
            mtmp.malign = 3 * Math.max(5, absmal);
    } else if (mondata.always_hostile(mtmp.data)) {
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

export function m_initweap(mtmp) {
    // Stubbed until Stream D objects dependencies fully satisfied
}

export function m_initinv(mtmp) {
    // Stubbed until Stream D objects dependencies fully satisfied
}



export function m_initsgrp(mtmp, x, y, mmf) {
    m_initgrp(mtmp, x, y, 3, mmf);
}

export function m_initlgrp(mtmp, x, y, mmf) {
    m_initgrp(mtmp, x, y, 10, mmf);
}

export function m_initgrp(mtmp, x, y, n, mmflags) {
    let mm = { x: 0, y: 0 };
    let cnt = rnd(n);
    let mon;

    cnt = Math.trunc(cnt / ((game.u.ulevel < 3) ? 4 : (game.u.ulevel < 5) ? 2 : 1));
    if (!cnt) cnt++;

    mm.x = x;
    mm.y = y;
    while (cnt--) {
        if (peace_minded(mtmp.data)) continue;

        if (enexto_core(mm, mm.x, mm.y, mtmp.data, mmflags)) {
            mon = makemon(mtmp.data, mm.x, mm.y, (mmflags | C.MM_NOGRP));
            if (mon) {
                mon.mpeaceful = 0;
                mon.mavenge = 0;
                set_malign(mon);
            }
        }
    }
}

export function makemon(ptr, x, y, mmflags) {
    let mtmp;
    let cc = { x: 0, y: 0 };
    let mndx, mcham, ct, mitem;
    let anymon = !ptr;
    let byyou = hacklib.u_at(x, y);
    let allow_minvent = (mmflags & C.NO_MINVENT) === 0;
    let countbirth = (mmflags & C.MM_NOCOUNTBIRTH) === 0;
    let allowtail = (mmflags & C.MM_NOTAIL) === 0;
    let gpflags = ((mmflags & C.MM_IGNOREWATER) ? C.MM_IGNOREWATER : 0) | C.GP_CHECKSCARY | C.GP_AVOID_MONPOS;

    let fakemon = newmonst(); // we just need an empty one for goodpos

    if (!game.level.flags.rndmongen && !ptr)
        return null;

    if (x === 0 && y === 0) {
        fakemon.data = ptr;
        if (!makemon_rnd_goodpos(ptr ? fakemon : null, gpflags, cc))
            return null;
        x = cc.x;
        y = cc.y;
    } else if (byyou && !game.gi.in_mklev) {
        if (!enexto_core(cc, game.u.ux, game.u.uy, ptr, gpflags) &&
            !enexto_core(cc, game.u.ux, game.u.uy, ptr, gpflags & ~C.GP_CHECKSCARY))
            return null;
        x = cc.x;
        y = cc.y;
    }

    if (!isok(x, y)) return null;

    if (hacklib.MON_AT(x, y)) {
        if (!(mmflags & C.MM_ADJACENTOK) || !enexto_core(cc, x, y, ptr, gpflags))
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
            if (!(ptr = rndmonst())) return null;
            fakemon.data = ptr;
        } while (++tryct <= 50 &&
                 ((tryct === 1 && mondata.throws_rocks(ptr) && hacklib.In_sokoban()) ||
                  !goodpos(x, y, fakemon, gpflags)));
        mndx = mondata.monsndx(ptr);
    }

    // propel propagate...
    // propagate(mndx, countbirth, false);

    mtmp = newmonst();

    if (mmflags & C.MM_EGD) { /* newegd(mtmp); */ }
    if (mmflags & C.MM_EPRI) { /* newepri(mtmp); */ }
    if (mmflags & C.MM_ESHK) { /* neweshk(mtmp); */ }
    if (mmflags & C.MM_EMIN) { /* newemin(mtmp); */ }
    if (mmflags & C.MM_EDOG) { /* newedog(mtmp); */ }

    if (mmflags & C.MM_ASLEEP)
        mtmp.msleeping = 1;

    // mtmp.nmon = fmon;
    // fmon = mtmp;
    mtmp.m_id = next_ident();
    mtmp.data = ptr;

    if (ptr.msound === C.MS_LEADER && hacklib.quest_info(C.MS_LEADER) === mndx)
        game.svq.quest_status.leader_m_id = mtmp.m_id;

    mtmp.mnum = mndx;
    newmonhp(mtmp, mndx);

    let femaleok = (!mondata.is_male(ptr) && !mondata.is_neuter(ptr));
    let maleok = (!mondata.is_female(ptr) && !mondata.is_neuter(ptr));

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

    // ...
    place_monster(mtmp, x, y);
    mtmp.mcansee = mtmp.mcanmove = 1;
    mtmp.mgenmklev = game.gi.in_mklev;
    mtmp.seen_resistance = C.M_SEEN_NOTHING;
    mtmp.mpeaceful = (mmflags & C.MM_ANGRY) ? 0 : (peace_minded(ptr) ? 1 : 0);

    // ... Light source ...

    mitem = C.STRANGE_OBJECT;
    if (mndx === C.PM_VLAD_THE_IMPALER) mitem = C.CANDELABRUM_OF_INVOCATION;
    mtmp.cham = C.NON_PM;


    if (!game.u.uprops[C.PROT_FROM_SHAPE_CHANGERS].extrinsic && (mcham = mondata.pm_to_cham(mndx)) !== C.NON_PM) {
        mtmp.cham = mcham;
        if (mndx !== C.PM_VLAD_THE_IMPALER && hacklib.newcham(mtmp, null, C.NO_NC_FLAGS))
            allow_minvent = false;
    } else if (mndx === C.PM_WIZARD_OF_YENDOR) {
        mtmp.iswiz = 1;
        game.svc.context.no_of_wizards++;
        if (game.svc.context.no_of_wizards === 1 && C.Is_earthlevel()) mitem = C.SPE_DIG;
    } else if (mndx === C.PM_GHOST && !(mmflags & C.MM_NONAME)) {
        // mtmp = christen_monst(mtmp, rndghostname());
    } else if (mndx === C.PM_CROESUS) {
        mitem = C.TWO_HANDED_SWORD;
    } else if (ptr.msound === C.MS_NEMESIS) {
        mitem = C.BELL_OF_OPENING;
    } else if (mndx === C.PM_PESTILENCE) {
        mitem = C.POT_SICKNESS;
    }

    if (mitem !== C.STRANGE_OBJECT && allow_minvent) {
        // mongets(mtmp, mitem);
    }

    if (game.gi.in_mklev) {
        if ((mondata.is_ndemon(ptr) || mndx === C.PM_WUMPUS || mndx === C.PM_LONG_WORM || mndx === C.PM_GIANT_EEL) && !game.u.uhave.amulet && rn2(5))
            mtmp.msleeping = 1;
    } else {
        if (byyou) {
            // newsym(mtmp.mx, mtmp.my);
            // set_apparxy(mtmp);
        }
    }

    // ...
    set_malign(mtmp);
    if (anymon && !(mmflags & C.MM_NOGRP)) {
        if ((ptr.geno & C.G_SGROUP) && rn2(2)) {
            m_initsgrp(mtmp, mtmp.mx, mtmp.my, mmflags);
        } else if (ptr.geno & C.G_LGROUP) {
            if (rn2(3)) m_initlgrp(mtmp, mtmp.mx, mtmp.my, mmflags);
            else m_initsgrp(mtmp, mtmp.mx, mtmp.my, mmflags);
        }
    }

    if (allow_minvent) {
        if (mondata.is_armed(ptr)) m_initweap(mtmp);
        m_initinv(mtmp);
        // m_dowear(mtmp, true);
        if (!rn2(100) && mondata.is_domestic(ptr) && hacklib.can_saddle(mtmp) && !hacklib.which_armor(mtmp, C.W_SADDLE)) {
            // put_saddle_on_mon(null, mtmp);
        }
    }

    return mtmp;
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
        let bl = (game.gi.in_mklev || game.u.uprops[C.BLINDED].extrinsic) ? 1 : 0;

        for ( ; bl < 2; bl++) {
            if (!bl) gpflags &= ~C.GP_CHECKSCARY;
            for (dx = 0; dx < C.COLNO; dx++) {
                for (dy = 0; dy < C.ROWNO; dy++) {
                    nx = ((dx + xofs) % (C.COLNO - 1)) + 1;
                    ny = ((dy + yofs) % (C.ROWNO - 1)) + 1;
                    if (bl === 0 && hacklib.cansee(nx, ny)) continue;
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
