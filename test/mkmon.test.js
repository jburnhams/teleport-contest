import { describe, it, expect, beforeEach } from 'vitest';
import { newmonst, place_monster, m_at, DEADMONSTER, goodpos_onscary, newmonhp } from '../js/mkmon.js';
import { game, resetGame } from '../js/gstate.js';
import { GameMap } from '../js/game.js';
import { MON_FLOOR, S_HUMAN, S_ANGEL, S_DEMON } from '../js/const.js';
import { initRng } from '../js/rng.js';
import { mons } from '../js/monst.js';

describe('mkmon', () => {
    beforeEach(() => {
        resetGame();
        game.level = new GameMap();
        game.context = { ident: 1 };
        game.u = { ulevel: 1, uz: { dnum: 0, dlevel: 1 } };
        initRng(12345);
    });

    it('newmonst creates a monster matching struct monst shape and allocates id', () => {
        const mon = newmonst();
        expect(mon.mhp).toBe(0);
        expect(mon.mstate).toBe(MON_FLOOR);
        expect(mon.m_id).toBeGreaterThan(0);
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

    it('goodpos_onscary matches C logic', () => {
        expect(goodpos_onscary(0, 0, {mlet: S_HUMAN})).toBe(true);
        expect(goodpos_onscary(0, 0, {mlet: S_ANGEL})).toBe(true);
        expect(goodpos_onscary(0, 0, {mlet: S_DEMON})).toBe(true);
        expect(goodpos_onscary(0, 0, {mlet: 999})).toBe(false);
    });

    it('newmonhp consumes rng for random hp', () => {
        const mon = newmonst();
        const mndx = 0; // giant ant, level 2
        newmonhp(mon, mndx);
        expect(mon.mhp).toBeGreaterThan(0);
        expect(mon.mhpmax).toBeGreaterThan(0);
    });
});
