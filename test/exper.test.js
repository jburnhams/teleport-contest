import { describe, it, expect, beforeEach } from 'vitest';
import { newuexp, newhp, newpw } from '../js/exper.js';
import { game, resetGame } from '../js/gstate.js';
import { initRng } from '../js/rng.js';
import { findRole, findRace } from '../js/roles.js';

describe('exper.js', () => {
    beforeEach(() => {
        resetGame();
        initRng(12345);
        game.urole = findRole('Wizard');
        game.urace = findRace('human');
        game.u = { ulevel: 0, abase: { a: [10,10,10,10,10,10] }, abon: { a: [0,0,0,0,0,0] }, atemp: { a: [0,0,0,0,0,0] } };
    });

    it('newuexp calculates experience thresholds', () => {
        expect(newuexp(0)).toBe(0);
        expect(newuexp(1)).toBe(10);
        expect(newuexp(2)).toBe(20);
        expect(newuexp(10)).toBe(10000);
        expect(newuexp(20)).toBe(10000000);
    });

    it('newhp calculates starting HP at level 0', () => {
        const hp = newhp();
        expect(hp).toBeGreaterThan(0);
    });

    it('newhp calculates level-up HP for level < 10', () => {
        game.u.ulevel = 5;
        const hp = newhp();
        expect(hp).toBeGreaterThan(0);
    });

    it('newhp calculates level-up HP for level >= 10', () => {
        game.u.ulevel = 15;
        const hp = newhp();
        expect(hp).toBeGreaterThan(0);
    });

    it('newpw calculates starting PW at level 0', () => {
        const pw = newpw();
        expect(pw).toBeGreaterThan(0);
    });

    it('newpw calculates level-up PW', () => {
        game.u.ulevel = 5;
        const pw = newpw();
        expect(pw).toBeGreaterThan(0);
    });
});
