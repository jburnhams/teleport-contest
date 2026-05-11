import { describe, it, expect, beforeEach } from 'vitest';
import { rndmonnum, rndmonnum_adj } from '../js/mkobj.js';
import { game, svd, svm } from '../js/gstate.js';
import * as C from '../js/const.js';
import { mons } from '../js/monst.js';
import { initRng, enableRngLog, getRngLog } from '../js/rng.js';

describe('rndmonnum', () => {
    beforeEach(() => {
        game.u = { uz: { dnum: 0, dlevel: 1 }, ulevel: 1 };
        game.svd = { dungeons: [{ depth_start: 1, flags: { hellish: 0, align: C.AM_NONE } }] };
        game.svm = { moves: 1, mvitals: [] };
        for (let i = 0; i < mons.length; i++) {
            game.svm.mvitals[i] = { mvflags: 0 };
        }
        initRng(1);
        enableRngLog();
    });

    it('returns a monster index', () => {
        const idx = rndmonnum();
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(C.SPECIAL_PM);
    });
});
