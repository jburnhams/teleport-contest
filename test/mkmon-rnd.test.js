import { describe, it, expect, beforeEach } from 'vitest';
import { rndmonnum, rndmonst } from '../js/mkmon.js';
import * as C from '../js/const.js';
import { game } from '../js/gstate.js';
import * as rng from '../js/rng.js';

describe('mkmon rnd functions', () => {
    beforeEach(() => {
        game.u = { uz: { dnum: 0, dlevel: 1 }, ulevel: 1, uhave: { amulet: 0 } };
        game.dungeons = [{ flags: { align: C.AM_NONE, hellish: 0 } }];
        game.level = { flags: { temperature: 0 } };
        game.mvitals = Array(1000).fill({ mvflags: 0 });
    });

    it('rndmonst works', () => {
        rng.initRng(12345);
        const ptr = rndmonst();
        expect(ptr).not.toBeNull();
    });

    it('rndmonnum works', () => {
        rng.initRng(12345);
        const mndx = rndmonnum();
        expect(mndx).toBeGreaterThanOrEqual(C.LOW_PM);
    });
});
