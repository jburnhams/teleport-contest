import { describe, it, expect, beforeEach, vi } from 'vitest';
import { newmonst, place_monster, m_at, DEADMONSTER } from '../js/mkmon.js';
import { game, resetGame } from '../js/gstate.js';
import { GameMap } from '../js/game.js';
import { MON_FLOOR } from '../js/const.js';

describe('mkmon', () => {
    beforeEach(() => {
        resetGame();
        game.level = new GameMap();
        game.context = { ident: 1 };

        // Setup mock rng
        vi.mock('../js/mkobj.js', () => ({
            next_ident: () => 1
        }));

        vi.mock('../js/rng.js', () => ({
            rnd: () => 1
        }));
    });

    it('newmonst creates a monster matching struct monst shape and allocates id', () => {
        const mon = newmonst();
        expect(mon.mhp).toBe(0);
        expect(mon.mstate).toBe(MON_FLOOR);
        expect(mon.m_id).toBe(1);
    });

    it('place_monster correctly places monster on map and m_at fetches it', () => {
        const mon = newmonst();
        mon.mhp = 10;
        place_monster(mon, 5, 5);
        expect(mon.mx).toBe(5);
        expect(mon.my).toBe(5);
        expect(m_at(5, 5)).toBe(mon);
        expect(mon.mstate).toBe(MON_FLOOR);
    });

    it('DEADMONSTER correctly checks hp', () => {
        const mon = newmonst();
        mon.mhp = 0;
        expect(DEADMONSTER(mon)).toBe(true);
        mon.mhp = 5;
        expect(DEADMONSTER(mon)).toBe(false);
    });
});
