import { describe, it, expect, beforeEach } from 'vitest';
import { acurr, adjattrib, init_attr, vary_init_attr, acurrstr, A_STR } from '../js/attrib.js';
import { game, resetGame } from '../js/gstate.js';
import { initRng } from '../js/rng.js';
import { findRole, findRace } from '../js/roles.js';

describe('attrib.js', () => {
    beforeEach(() => {
        resetGame();
        initRng(12345);
        game.urole = findRole('Wizard');
        game.urace = findRace('human');
        game.u = {
            abase: { a: [10,10,10,10,10,10] },
            amax: { a: [10,10,10,10,10,10] },
            abon: { a: [0,0,0,0,0,0] },
            atemp: { a: [0,0,0,0,0,0] },
            acurr: { a: [10,10,10,10,10,10] }
        };
    });

    it('acurr calculates current attribute value', () => {
        game.u.abon.a[0] = 1;
        game.u.atemp.a[0] = 2;
        expect(acurr(0)).toBe(13);
    });

    it('adjattrib modifies attributes', () => {
        adjattrib(0, 1, false);
        expect(game.u.abase.a[0]).toBe(11);
        expect(game.u.amax.a[0]).toBe(11);

        adjattrib(0, -1, false);
        expect(game.u.abase.a[0]).toBe(10);
    });

    it('adjattrib handles negative increment with min check', () => {
        game.u.abase.a[0] = 3;
        adjattrib(0, -1, false); // should trigger rn2 check for min
        expect(game.u.abase.a[0]).toBe(3);
    });

    it('init_attr_role_redist adjusts attributes', () => {
        init_attr(75); // sets base then redistributes
        const sum = game.u.abase.a.reduce((a, b) => a + b, 0);
        expect(sum).toBe(75);
    });

    it('init_attr sets initial attributes', () => {
        init_attr(75);
        expect(game.u.abase.a).toHaveLength(6);
    });

    it('vary_init_attr randomizes attributes', () => {
        vary_init_attr();
        // Just verify it runs
    });

    it('acurrstr returns strength as human-readable', () => {
        expect(typeof acurrstr()).toBe('number');
    });
});
