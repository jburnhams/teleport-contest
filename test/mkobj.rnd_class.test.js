import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rnd_class } from '../js/mkobj.js';
import { objects, STRANGE_OBJECT } from '../js/objects.js';
import { initRng, enableRngLog, getRngLog } from '../js/rng.js';

describe('rnd_class', () => {
    let originalProbs = {};

    beforeEach(() => {
        // Save original oc_prob for restoration
        originalProbs = {};
        for (let i = 0; i < objects.length; i++) {
            originalProbs[i] = objects[i].oc_prob;
        }
    });

    afterEach(() => {
        // Restore original oc_prob
        for (let i = 0; i < objects.length; i++) {
            if (originalProbs[i] !== undefined) {
                objects[i].oc_prob = originalProbs[i];
            }
        }
    });

    it('returns STRANGE_OBJECT if last < first', () => {
        expect(rnd_class(5, 4)).toBe(STRANGE_OBJECT);
    });

    it('returns first if first == last', () => {
        expect(rnd_class(5, 5)).toBe(5);
    });

    it('uses rn1 for equal probability when sum is zero', () => {
        initRng(1);
        enableRngLog();

        // Setup probabilities to 0
        objects[10].oc_prob = 0;
        objects[11].oc_prob = 0;
        objects[12].oc_prob = 0;

        const result = rnd_class(10, 12);

        const log = getRngLog();
        expect(log.length).toBe(1);
        expect(log[0]).toMatch(/^rn2\(3\)=/);

        // Ensure result is within range
        expect(result).toBeGreaterThanOrEqual(10);
        expect(result).toBeLessThanOrEqual(12);
    });

    it('uses rnd and proportional probability when sum is > 0', () => {
        initRng(1);
        enableRngLog();

        objects[20].oc_prob = 10;
        objects[21].oc_prob = 20;
        objects[22].oc_prob = 30;
        // sum is 60. rnd(60) will be called (which does RND(60) + 1, so 1..60).

        const result = rnd_class(20, 22);

        const log = getRngLog();
        expect(log.length).toBe(1);
        expect(log[0]).toMatch(/^rnd\(60\)=/);

        // Result should be 20, 21, or 22 based on RNG.
        expect(result).toBeGreaterThanOrEqual(20);
        expect(result).toBeLessThanOrEqual(22);
    });
});
