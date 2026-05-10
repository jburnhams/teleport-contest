import { describe, it, expect, beforeEach } from 'vitest';
import { initRng, rn2, rnd, rn1, d, rne, rnz, enableRngLog, getRngLog } from '../js/rng.js';
import { resetGame, game } from '../js/gstate.js';

describe('rng.js', () => {
    beforeEach(() => {
        resetGame();
        initRng(12345);
        enableRngLog();
    });

    it('initializes with a seed and produces consistent results', () => {
        const val1 = rn2(100);
        
        resetGame();
        initRng(12345);
        const val2 = rn2(100);
        
        expect(val1).toBe(val2);
    });

    it('rn2(x) returns 0..x-1', () => {
        for (let i = 0; i < 100; i++) {
            const val = rn2(10);
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThan(10);
        }
        expect(rn2(0)).toBe(0);
        expect(rn2(-5)).toBe(0);
    });

    it('rnd(x) returns 1..x', () => {
        for (let i = 0; i < 100; i++) {
            const val = rnd(10);
            expect(val).toBeGreaterThanOrEqual(1);
            expect(val).toBeLessThanOrEqual(10);
        }
        expect(rnd(0)).toBe(0);
    });

    it('rn1(x, y) returns y..y+x-1', () => {
        for (let i = 0; i < 100; i++) {
            const val = rn1(10, 5);
            expect(val).toBeGreaterThanOrEqual(5);
            expect(val).toBeLessThan(15);
        }
    });

    it('d(n, x) rolls n dice of x sides', () => {
        const val = d(3, 6); // 3d6
        expect(val).toBeGreaterThanOrEqual(3);
        expect(val).toBeLessThanOrEqual(18);
    });

    it('rne(x) follows exponential distribution logic', () => {
        game.u = { ulevel: 1 };
        const val1 = rne(2);
        expect(val1).toBeGreaterThanOrEqual(1);
        
        game.u.ulevel = 30;
        const val2 = rne(2);
        expect(val2).toBeGreaterThanOrEqual(1);
    });

    it('rnz(i) fuzzy randomizes around i', () => {
        const val = rnz(100);
        expect(typeof val).toBe('number');
    });

    it('logs RNG calls when enabled', () => {
        enableRngLog();
        rn2(10);
        rnd(5);
        const log = getRngLog();
        expect(log.length).toBe(2);
        expect(log[0]).toMatch(/^rn2\(10\)=\d+$/);
        expect(log[1]).toMatch(/^rnd\(5\)=\d+$/);
    });
});
