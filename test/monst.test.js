import { describe, it, expect } from 'vitest';
import { mons, NUMMONS, PM_GIANT_ANT, PM_SHOPKEEPER, PM_NEWT } from '../js/monst.js';
import * as C from '../js/const.js';

describe('mons[] array verification', () => {
    it('has the correct length and terminator', () => {
        // C includes a terminator at the end, so length is NUMMONS + 1
        expect(mons.length).toBe(NUMMONS + 1);

        // Verify the terminator element
        const terminator = mons[NUMMONS];
        expect(terminator.mname).toBe("");
        expect(terminator.mlet).toBe(0);
        expect(terminator.geno).toBe(C.G_NOGEN | C.G_NOCORPSE);
    });

    it('has correct data for PM_GIANT_ANT', () => {
        expect(PM_GIANT_ANT).toBeDefined();
        const ant = mons[PM_GIANT_ANT];
        expect(ant.mname).toBe("giant ant");
        expect(ant.mlet).toBe(C.S_ANT);
        expect(ant.mlevel).toBe(2);
        expect(ant.mmove).toBe(18);
        expect(ant.ac).toBe(3);
        expect(ant.mattk[0].at).toBe(C.AT_BITE);
        expect(ant.mattk[0].ad).toBe(C.AD_PHYS);
        expect(ant.mattk[0].damn).toBe(1);
        expect(ant.mattk[0].damd).toBe(4);
    });

    it('has correct data for PM_NEWT', () => {
        expect(PM_NEWT).toBeDefined();
        const newt = mons[PM_NEWT];
        expect(newt.mname).toBe("newt");
    });
});
