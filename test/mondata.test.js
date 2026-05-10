import { describe, it, expect } from 'vitest';
import { mons } from '../js/monst.js';
import * as MD from '../js/mondata.js';
import * as C from '../js/const.js';

describe('E2 - mondata helpers', () => {
    it('monsndx returns correct index', () => {
        expect(MD.monsndx(mons[0])).toBe(0); // Giant Ant
    });

    it('giant ant correctly resolves flags', () => {
        const ant = mons[0];
        expect(MD.is_animal(ant)).toBe(true);
        expect(MD.nohands(ant)).toBe(true);
        expect(MD.is_flyer(ant)).toBe(false);
        expect(MD.is_swimmer(ant)).toBe(false);
        expect(MD.is_undead(ant)).toBe(false);
        expect(MD.is_demon(ant)).toBe(false);
    });
});
