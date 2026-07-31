import { initRng } from '../js/rng.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { goodpos, enexto, goodpos_onscary, newmonst, m_at, collect_coords, place_monster } from '../js/mkmon.js';
import { game, resetGame } from '../js/gstate.js';
import { GameMap } from '../js/game.js';
import { NO_MM_FLAGS } from '../js/const.js';

describe('goodpos and enexto', () => {
    beforeEach(() => {
        resetGame();
        initRng("12345");
        game.level = new GameMap();
        game.context = { ident: 1 };

        // initialize some map cells for goodpos checks
        for (let x = 1; x < 80; x++) {
            for (let y = 0; y < 21; y++) {
                game.level.locations[x][y] = { typ: 25, drawbridgemask: 0, doormask: 0 }; // ROOM is 25
            }
        }

        // Setup mock rng
        vi.mock('../js/mkobj.js', () => ({
            next_ident: () => 1
        }));


    });

    it('goodpos should return true for empty accessible location', () => {
        let mon = newmonst();
        mon.data = {};
        expect(goodpos(5, 5, mon, NO_MM_FLAGS)).toBe(true);
    });

    it('goodpos should return false for out of bounds location', () => {
        let mon = newmonst();
        expect(goodpos(0, 0, mon, NO_MM_FLAGS)).toBe(false);
    });

    it('enexto should find adjacent free spot', () => {
        let mon = newmonst();
        mon.data = {};
        let cc = {x: 0, y: 0};

        // Place a monster at 5,5
        place_monster(mon, 5, 5);

        // Try to place another monster next to 5,5
        expect(enexto(cc, 5, 5, {})).toBe(true);
        // It shouldn't pick 5,5 itself since there's a monster there and it's not GP_ALLOW_XY
        expect(cc.x === 5 && cc.y === 5).toBe(false);
    });
});
