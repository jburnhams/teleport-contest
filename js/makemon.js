// C ref: makemon.c
import { game } from './gstate.js';
import { mons } from './monst.js';
import * as C from './const.js';
import { level_difficulty } from './hacklib.js';
import { monsndx, monmin_difficulty, monmax_difficulty, montooweak, montoostrong, is_swimmer, is_flyer, is_floater, amorphous, is_whirly, noncorporeal, pm_resistance, monsym } from './mondata.js';
function Is_rogue_level(uz) { return false; }
function In_endgame(uz) { return false; }
function Is_astralevel(uz) { return false; }
function Is_earthlevel(uz) { return false; }
function Is_waterlevel(uz) { return false; }
function Is_firelevel(uz) { return false; }
function Is_airlevel(uz) { return false; }
 // Can be moved to hacklib later
import { rn2 } from './rng.js';

function Inhell() {
    if (!game.u || !game.u.uz || !game.svd || !game.svd.dungeons) return false;
    return game.svd.dungeons[game.u.uz.dnum].flags.hellish !== 0;
}

function is_home_elemental(ptr) {
    if (ptr.mlet === C.S_ELEMENTAL) {
        switch (monsndx(ptr)) {
            case C.PM_AIR_ELEMENTAL:
                return Is_airlevel(game.u.uz);
            case C.PM_FIRE_ELEMENTAL:
                return Is_firelevel(game.u.uz);
            case C.PM_EARTH_ELEMENTAL:
                return Is_earthlevel(game.u.uz);
            case C.PM_WATER_ELEMENTAL:
                return Is_waterlevel(game.u.uz);
        }
    }
    return false;
}

function wrong_elem_type(ptr) {
    if (ptr.mlet === C.S_ELEMENTAL) {
        return !is_home_elemental(ptr);
    } else if (Is_earthlevel(game.u.uz)) {
        // no restrictions?
    } else if (Is_waterlevel(game.u.uz)) {
        // just monsters that can swim
        if (!is_swimmer(ptr)) return true;
    } else if (Is_firelevel(game.u.uz)) {
        if (!pm_resistance(ptr, C.MR_FIRE)) return true;
    } else if (Is_airlevel(game.u.uz)) {
        if (!(is_flyer(ptr) && ptr.mlet !== C.S_TRAPPER) && !is_floater(ptr)
            && !amorphous(ptr) && !noncorporeal(ptr) && !is_whirly(ptr))
            return true;
    }
    return false;
}

function uncommon(mndx) {
    if ((mons[mndx].geno & (C.G_NOGEN | C.G_UNIQ)) !== 0)
        return true;
    if (game.svm && game.svm.mvitals && (game.svm.mvitals[mndx].mvflags & C.G_GONE) !== 0)
        return true;
    if (Inhell())
        return mons[mndx].maligntyp > C.A_NEUTRAL;
    else
        return (mons[mndx].geno & C.G_HELL) !== 0;
}

let oldmoves = 0;
let saved_lev = null;

function align_shift(ptr) {
    let alshift;

    if (game.svm && oldmoves !== game.svm.moves) {
        saved_lev = Is_special(game.u.uz);
        oldmoves = game.svm.moves;
    }
    const align = (saved_lev) ? saved_lev.flags.align : (game.svd && game.svd.dungeons ? game.svd.dungeons[game.u.uz.dnum].flags.align : C.AM_NONE);

    // C.ALIGNWEIGHT is 4 in align.h
    const ALIGNWEIGHT = 4;

    switch (align) {
    default:
    case C.AM_NONE:
        alshift = 0;
        break;
    case C.AM_LAWFUL:
        alshift = Math.floor((ptr.maligntyp + 20) / (2 * ALIGNWEIGHT));
        break;
    case C.AM_NEUTRAL:
        alshift = Math.floor((20 - Math.abs(ptr.maligntyp)) / ALIGNWEIGHT);
        break;
    case C.AM_CHAOTIC:
        alshift = Math.floor((-(ptr.maligntyp - 20)) / (2 * ALIGNWEIGHT));
        break;
    }
    return alshift;
}

function temperature_shift(ptr) {
    // svl.level.flags.temperature
    if (game.level && game.level.flags && game.level.flags.temperature !== undefined && game.level.flags.temperature !== 0) {
        if (pm_resistance(ptr, (game.level.flags.temperature > 0) ? C.MR_FIRE : C.MR_COLD))
            return 3;
    }
    return 0;
}

// C ref: qt_montype (stub since quest isn't fully implemented yet)
function qt_montype() {
    return null;
}

function Is_special(uz) {
    // For now, return null as special levels and sp_levchn are not fully populated.
    return null;
}

export function rndmonst() {
    return rndmonst_adj(0, 0);
}

export function rndmonst_adj(minadj, maxadj) {
    let ptr;
    let weight, totalweight = 0, selected_mndx = C.NON_PM;

    // if (u.uz.dnum == quest_dnum && rn2(7) && (ptr = qt_montype()) != 0) return ptr;

    let zlevel = level_difficulty();
    let minmlev = monmin_difficulty(zlevel) + minadj;
    let maxmlev = monmax_difficulty(zlevel) + maxadj;
    let upper = Is_rogue_level(game.u.uz);
    let elemlevel = In_endgame(game.u.uz) && !Is_astralevel(game.u.uz);

    for (let mndx = C.LOW_PM; mndx < C.SPECIAL_PM; ++mndx) {
        ptr = mons[mndx];

        if (montooweak(mndx, minmlev) || montoostrong(mndx, maxmlev))
            continue;
        if (upper && monsym(ptr) !== monsym(ptr).toUpperCase())
            continue;
        if (elemlevel && wrong_elem_type(ptr))
            continue;
        if (uncommon(mndx))
            continue;
        if (Inhell() && (ptr.geno & C.G_NOHELL) !== 0)
            continue;

        weight = (ptr.geno & C.G_FREQ) + align_shift(ptr);
        weight += temperature_shift(ptr);

        if (weight < 0 || weight > 127) {
            // impossible
            weight = 0;
        }

        if (weight > 0) {
            totalweight += weight;
            if (rn2(totalweight) < weight)
                selected_mndx = mndx;
        }
    }

    if (selected_mndx === C.NON_PM || uncommon(selected_mndx)) {
        return null;
    }
    return mons[selected_mndx];
}
