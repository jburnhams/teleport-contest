import { describe, it, expect } from 'vitest';
import { init_objects, bases, oclass_prob_totals } from '../js/o_init.js';
import { MAXOCLASSES } from '../js/const.js';
import { initRng } from '../js/rng.js';

describe('o_init.js init_objects() logic', () => {
    it('initializes bases and oclass_prob_totals correctly without throwing', () => {
        initRng(1); // Set up RNG context so rn2 calls inside init_objects don't fail
        init_objects();
        
        expect(bases.length).toBe(MAXOCLASSES + 2);
        expect(oclass_prob_totals.length).toBe(MAXOCLASSES);

        // Verify bases ends with NUM_OBJECTS and starts with some positive integer index.
        expect(bases[MAXOCLASSES]).toBeGreaterThan(0);
        expect(bases[MAXOCLASSES + 1]).toBe(bases[MAXOCLASSES]);
        
        // Spot check oclass_prob_totals
        // Many classes have 1000 total probability
        expect(oclass_prob_totals[3]).toBeGreaterThan(0);
    });
});
