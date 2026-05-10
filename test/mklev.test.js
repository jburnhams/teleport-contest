import { describe, it, expect, beforeEach } from 'vitest';
import { mklev, u_on_upstairs, l_nhcore_init } from '../js/mklev.js';
import { game, resetGame } from '../js/gstate.js';
import { initRng, enableRngLog, getRngLog } from '../js/rng.js';
import { init_vision_globals } from '../js/vision.js';

describe('mklev.js', () => {
    beforeEach(() => {
        resetGame();
        init_vision_globals();
        initRng(8000);
        enableRngLog();
        game.u = { ux: 0, uy: 0, uz: { dnum: 0, dlevel: 1 } };
    });

    it('mklev generates a level and consumes RNG', async () => {
        await mklev();
        const log = getRngLog();
        expect(log.length).toBeGreaterThan(0);
        expect(game.level.nroom).toBeGreaterThan(0);
    });

    it('u_on_upstairs places hero on upstairs', async () => {
        await mklev(); // Generates stairs
        u_on_upstairs();
        expect(game.u.ux).toBeGreaterThan(0);
        expect(game.u.uy).toBeGreaterThan(0);
    });

    it('l_nhcore_init shuffles alignment', () => {
        l_nhcore_init();
        expect(game.splev_align).toHaveLength(3);
    });
});
