import { describe, it, expect } from 'vitest';
import { roles, races, aligns, genders } from '../js/roles.js';
import * as C from '../js/const.js';
import * as M from '../js/monst.js';
import * as O from '../js/objects.js';

describe('A3 - Data Tables (roles, races, aligns, genders)', () => {
    it('should have 13 roles', () => {
        expect(roles.length).toBe(13);
    });

    it('should have 5 races', () => {
        expect(races.length).toBe(5);
    });

    it('should have 4 aligns', () => {
        expect(aligns.length).toBe(4);
    });

    it('should have 4 genders', () => {
        expect(genders.length).toBe(4);
    });

    it('should correctly define Archeologist', () => {
        const arc = roles[0];
        expect(arc.name.m).toBe("Archeologist");
        expect(arc.mnum).toBe(M.PM_ARCHEOLOGIST);
        expect(arc.xlev).toBe(14);
        expect(arc.hpadv.infix).toBe(11);
        expect(arc.attrdist).toEqual([20, 20, 20, 10, 20, 10]);
    });

    it('should correctly define human race', () => {
        const hum = races[0];
        expect(hum.noun).toBe("human");
        expect(hum.mnum).toBe(M.PM_HUMAN);
        expect(hum.hpadv.infix).toBe(2);
        expect(hum.hpadv.inrnd).toBe(0);
        expect(hum.enadv.infix).toBe(1);
    });
});
