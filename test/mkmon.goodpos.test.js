import { describe, it, expect, beforeEach } from 'vitest';
import { newmonst, goodpos, enexto } from '../js/mkmon.js';
import { game, resetGame } from '../js/gstate.js';
import { GameMap } from '../js/game.js';
import * as C from '../js/const.js';
import { initRng } from '../js/rng.js';

describe('goodpos & enexto', () => {
    beforeEach(() => {
        resetGame();
        game.level = new GameMap();
        game.context = { ident: 1 };
        game.u = {
            ux: 5, uy: 5,
            umonster: C.PM_HUMAN,
            uprops: {
                [C.DISPLACED]: { extrinsic: 0 },
                [C.BLINDED]: { extrinsic: 0 }
            }
        };
        game.gy = { youmonst: {} };
        game.gi = { in_mklev: false };

        // Use real PRNG and seed it deterministically for bit-exact tests
        initRng(12345n);
    });

    it('goodpos correctly evaluates position', () => {
        let mon = newmonst();
        mon.data = { mlet: C.S_ANT, mflags1: 0, mflags2: 0 };
        expect(goodpos(3, 3, mon, 0)).toBe(true);
    });
});
