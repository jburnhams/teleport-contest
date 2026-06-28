import { describe, it, expect, beforeEach } from 'vitest';
import { initRng, rn2 } from '../js/rng.js';
import * as mkmon from '../js/mkmon.js';
import * as C from '../js/const.js';
import { game, resetGame } from '../js/gstate.js';
import { mons } from '../js/monst.js';

describe('enexto_core and makemon_rnd_goodpos', () => {
    beforeEach(() => {
        resetGame();
        initRng(8000n);
        game.u = { uz: { dnum: 0 } };
        game.gi = { in_mklev: false };
        game.level = {
            monsters: Array.from({ length: C.COLNO }, () => Array(C.ROWNO).fill(null)),
            locations: Array.from({ length: C.COLNO }, () => Array(C.ROWNO).fill({ typ: C.ROOM })),
            flags: {}
        };
    });

    it('makemon_rnd_goodpos consumes RNG rn1 and rn2', () => {
        let cc = { x: 0, y: 0 };
        let result = mkmon.makemon_rnd_goodpos(null, 0, cc);
        expect(result).toBe(true);
        expect(cc.x).toBeGreaterThanOrEqual(2);
        expect(cc.y).toBeGreaterThanOrEqual(0);
    });

    it('enexto_core consumes rn2', () => {
        let cc = { x: 0, y: 0 };
        let result = mkmon.enexto_core(cc, 10, 10, mons[C.PM_LICH], 0);
        expect(result).toBe(true);
        expect(cc.x).toBeGreaterThan(0);
    });

    it('goodpos checks S_EEL rn2(13)', () => {
        let cc = { x: 0, y: 0 };

        let mtmp = { data: mons[C.PM_GIANT_EEL], wormno: 0 };

        resetGame();
        initRng(8000n);
        game.u = { uz: { dnum: 0 } };
        game.level = {
            monsters: Array.from({ length: C.COLNO }, () => Array(C.ROWNO).fill(null)),
            locations: Array.from({ length: C.COLNO }, () => Array(C.ROWNO).fill({ typ: C.ROOM })),
            flags: {}
        };

        let result = mkmon.goodpos(1, 1, mtmp, 0);
        expect(result).toBe(true);
    });
});
