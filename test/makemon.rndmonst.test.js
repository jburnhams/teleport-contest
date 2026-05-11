import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rndmonst, rndmonst_adj } from '../js/makemon.js';
import { mons } from '../js/monst.js';
import { game } from '../js/gstate.js';
import * as C from '../js/const.js';
import { initRng, enableRngLog, getRngLog } from '../js/rng.js';

describe('rndmonst', () => {
    beforeEach(() => {
        game.u = {
            uz: { dnum: 0, dlevel: 1 },
            ulevel: 1
        };
        game.svd = { dungeons: [{ depth_start: 1, flags: { hellish: 0, align: C.AM_NONE } }] };
        game.svm = { moves: 1, mvitals: [] };

        for (let i = 0; i < mons.length; i++) {
            game.svm.mvitals[i] = { mvflags: 0 };
        }

        initRng(1);
        enableRngLog();
    });

    it('returns a monster based on RNG and difficulty', () => {
        const ptr = rndmonst();
        expect(ptr).toBeDefined();

        const log = getRngLog();
        expect(log.length).toBeGreaterThan(0);
        // Ensure it doesn't return an uncommon one
        expect(ptr.geno & (C.G_NOGEN | C.G_UNIQ)).toBe(0);
    });
});
