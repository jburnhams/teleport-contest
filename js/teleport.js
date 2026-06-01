// C ref: teleport.c
import { game } from './gstate.js';
import * as C from './const.js';
import { mons } from './monst.js';
import { rn1, rn2 } from './rng.js';
import * as mondata from './mondata.js';
import * as hacklib from './hacklib.js';
import { m_at } from './mkmon.js';
import { isok } from './hacklib.js';

export function collect_coords(ccc, cx, cy, maxradius, cc_flags, filter) {
    let x, y, lox, hix, loy, hiy;
    let radius, rowrange, colrange, k, n = 0;
    let passcc = null;
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

    let passcc_idx = 0; // Index into ccc to track 'passcc' pointer

    for (radius = include_cxcy ? 0 : 1; radius <= maxradius; ++radius) {
        if (!ring_pairs) {
            newpass = passend = true;
        } else {
            newpass = ((radius % 2) !== 0 || radius === 0);
            passend = ((radius % 2) === 0 || radius === maxradius);
        }
        if (newpass || passcc === null) {
            passcc = true; // just to make it non-null for logic
            passcc_idx = result; // start of output entries for current radius
            n = 0;
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
                    || (skip_inaccessible && !hacklib.ZAP_POS(game.level.locations[x][y].typ)))
                    continue;
                if (filter && !filter(x, y))
                    continue;
                ccc[result] = { x: x, y: y };
                ++n;
                ++result;
            }
        }
        if (scramble && passend) {
            let offset = passcc_idx;
            while (n > 1) {
                k = rn2(n);
                if (k) {
                    let tmp = ccc[offset];
                    ccc[offset] = ccc[offset + k];
                    ccc[offset + k] = tmp;
                }
                ++offset;
                --n;
            }
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

    if (hacklib.Inhell() || hacklib.In_endgame())
        return false;

    if (mptr === mons[C.PM_MINOTAUR] || !mondata.haseyes(mptr))
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

    if (!isok(x, y))
        return false;

    if (!allow_u) {
        if (hacklib.u_at(x, y) && mtmp !== game.gy?.youmonst
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
            if (mtmp === game.gy?.youmonst)
                return (game.u.uprops[C.SWIMMING].extrinsic || game.u.uprops[C.SWIMMING].intrinsic || game.u.uprops[C.AMPHIBIOUS].extrinsic || game.u.uprops[C.AMPHIBIOUS].intrinsic
                        || (!C.Is_waterlevel(game.u.uz)
                            && !hacklib.is_waterwall(x, y)
                            && (game.u.uprops[C.LEVITATION].extrinsic || game.u.uprops[C.LEVITATION].intrinsic || game.u.uprops[C.FLYING].extrinsic || game.u.uprops[C.FLYING].intrinsic || game.u.uprops[C.WWALKING].extrinsic || game.u.uprops[C.WWALKING].intrinsic)));
            else
                return (mondata.is_swimmer(mdat)
                        || (!C.Is_waterlevel(game.u.uz)
                            && !hacklib.is_waterwall(x, y)
                            && mondata.m_in_air(mtmp)));
        } else if (mdat.mlet === C.S_EEL && rn2(13) && !ignorewater) {
            return false;
        } else if (hacklib.is_lava(x, y) && !ignorelava) {
            if (mdat === mons[C.PM_FLOATING_EYE])
                return false;
            else if (mtmp === game.gy?.youmonst)
                return (game.u.uprops[C.LEVITATION].extrinsic || game.u.uprops[C.LEVITATION].intrinsic || game.u.uprops[C.FLYING].extrinsic || game.u.uprops[C.FLYING].intrinsic
                        || (game.u.uprops[C.FIRE_RES].extrinsic || game.u.uprops[C.FIRE_RES].intrinsic && game.u.uprops[C.WWALKING].extrinsic || game.u.uprops[C.WWALKING].intrinsic && game.u.uarmf
                            && game.u.uarmf.oerodeproof)
                        || (game.u.umonnum !== game.u.umonster && mondata.likes_lava(game.gy.youmonst.data)));
            else
                return (mondata.m_in_air(mtmp) || mondata.likes_lava(mdat));
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
    let candy = new Array(C.ROWNO * (C.COLNO - 1));
    let i, nearcandyct, allcandyct;
    let fakemon = {
        data: null
    };
    let allow_xx_yy = (entflags & C.GP_ALLOW_XY) !== 0;

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

    cc.x = xx; cc.y = yy;
    if (allow_xx_yy && goodpos(cc.x, cc.y, fakemon, entflags))
        return true;

    return false;
}

// We'll export makemon_rnd_goodpos here since it relies on goodpos.
export function makemon_rnd_goodpos(mon, gpflags, cc) {
    let tryct = 0;
    let nx, ny;
    let good;

    gpflags |= C.GP_AVOID_MONPOS;
    do {
        nx = rn1(C.COLNO - 3, 2);
        ny = rn2(C.ROWNO);
        good = (!game.gi.in_mklev && hacklib.cansee(nx, ny)) ? false
                                              : goodpos(nx, ny, mon, gpflags);
    } while ((++tryct < 50) && !good);

    if (!good) {
        let xofs = nx;
        let yofs = ny;
        let dx, dy;
        let bl = (game.gi.in_mklev || game.u.uprops[C.BLINDED].extrinsic || game.u.uprops[C.BLINDED].intrinsic) ? 1 : 0;

        for ( ; bl < 2; bl++) {
            if (!bl)
                gpflags &= ~C.GP_CHECKSCARY;
            for (dx = 0; dx < C.COLNO; dx++)
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
