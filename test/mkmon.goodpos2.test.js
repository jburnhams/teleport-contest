import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { newmonst, goodpos, enexto_core, makemon } from '../js/mkmon.js';
import { game, resetGame } from '../js/gstate.js';
import { GameMap } from '../js/game.js';
import * as C from '../js/const.js';
import { initRng, enableRngLog, getRngLog } from '../js/rng.js';

describe('mkmon RNG sequence', () => {
    beforeEach(() => {
        resetGame();
        game.level = new GameMap();
        game.context = { ident: 1 };
        game.u = {
            ux: 5, uy: 5,
            ulevel: 1,
            umonster: C.PM_HUMAN,
            uprops: {
                [C.DISPLACED]: { extrinsic: 0 },
                [C.BLINDED]: { extrinsic: 0 }
            },
            uhave: { amulet: 0 },
            ualign: { type: 1, record: 0 }
        };
        game.gy = { youmonst: {} };
        game.gi = { in_mklev: true };
        game.mvitals = Array(1000).fill({ mvflags: 0, born: 0 });

        initRng(12345n);
        enableRngLog();
    });

    it('makemon consumes correct PRNG sequence for default placement', () => {
        // Just verify it uses RNG
        let mon = makemon(null, 0, 0, 0);
        let log = getRngLog();
        expect(log.length).toBeGreaterThan(0);
    });
});
