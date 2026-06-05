import { describe, it, expect, beforeEach, vi } from 'vitest';
import { goodpos, enexto, makemon_rnd_goodpos, collect_coords, CC_NO_FLAGS } from '../js/mkmon.js';
import { initRng, rn2 } from '../js/rng.js';
import { game, resetGame } from '../js/gstate.js';
import * as C from '../js/const.js';
import { mons } from '../js/monst.js';

describe('mkmon module', () => {
    beforeEach(() => {
        resetGame();
        initRng(12345);
        game.level = {
            locations: Array.from({ length: C.COLNO }, () =>
                Array.from({ length: C.ROWNO }, () => ({ typ: C.ROOM }))
            ),
            monsters: Array.from({ length: C.COLNO }, () =>
                Array.from({ length: C.ROWNO }, () => null)
            ),
            flags: { rndmongen: 1 }, objects: Array.from({ length: 80 }, () => Array.from({ length: 21 }, () => null))
        };
        game.u = {
            ux: 5, uy: 5,
            umonster: C.PM_ARCHEOLOGIST,
            uprops: {},
            uz: { dnum: 0, dlevel: 1 },
            ualign: { type: 1 },
            uhave: { amulet: 0 }
        };
        for (let i = 0; i < C.LAST_PROP; i++) {
            game.u.uprops[i] = { extrinsic: 0, intrinsic: 0 };
        }
        game.mvitals = Array.from({ length: C.NUMMONS }, () => ({ mvflags: 0, born: 0 }));
    });

    it('collect_coords should collect coordinates randomly but consistently', () => {
        let coords = new Array(C.ROWNO * (C.COLNO - 1));
        let count = collect_coords(coords, 10, 10, 3, CC_NO_FLAGS, null);
        expect(count).toBeGreaterThan(0);
        // Compare with a known seed state
        expect(coords[0]).toEqual({ x: 10, y: 9 });
        expect(coords[1]).toEqual({ x: 9, y: 9 });
    });

    it('makemon_rnd_goodpos should find a valid position', () => {
        let fakemon = { data: mons[C.PM_CAVE_SPIDER] };
        let cc = { x: 0, y: 0 };
        let result = makemon_rnd_goodpos(fakemon, C.GP_AVOID_MONPOS, cc);
        expect(result).toBe(true);
        expect(cc.x).toBeGreaterThan(0);
        expect(cc.y).toBeGreaterThanOrEqual(0);
    });

});
