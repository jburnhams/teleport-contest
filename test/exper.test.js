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

import { check_experience, pluslvl, losexp, rndexp } from '../js/exper.js';

describe('exper.js advanced', () => {
    beforeEach(() => {
        resetGame();
        initRng(12345);
        game.urole = findRole('Wizard');
        game.urace = findRace('human');
        game.u = {
            ulevel: 1,
            uexp: 0,
            uhpmax: 10,
            uhp: 10,
            uenmax: 10,
            uen: 10,
            uenpeak: 10,
            Upolyd: false,
            abase: { a: [10,10,10,10,10,10] },
            abon: { a: [0,0,0,0,0,0] },
            atemp: { a: [0,0,0,0,0,0] }
        };
    });

    it('check_experience does not level up if exp is low', () => {
        check_experience();
        expect(game.u.ulevel).toBe(1);
    });

    it('check_experience levels up if exp is sufficient', () => {
        game.u.uexp = 20; // 10 is needed for level 2
        check_experience();
        expect(game.u.ulevel).toBe(2);
    });

    it('pluslvl increments level', () => {
        pluslvl(true);
        expect(game.u.ulevel).toBe(2);
    });

    it('losexp decrements level if above 1', () => {
        game.u.ulevel = 2;
        game.u.uexp = 20;
        losexp();
        expect(game.u.ulevel).toBe(1);
        expect(game.u.uexp).toBe(9);
    });

    it('losexp clears exp if level 1', () => {
        game.u.ulevel = 1;
        game.u.uexp = 5;
        losexp();
        expect(game.u.ulevel).toBe(1);
        expect(game.u.uexp).toBe(0);
    });

    it('rndexp returns an expected range', () => {
        game.u.ulevel = 2;
        const res = rndexp(true);
        expect(res).toBeGreaterThanOrEqual(10);
        expect(res).toBeLessThanOrEqual(20);
    });
});
