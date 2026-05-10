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

    it('floating eye correctly resolves flags', () => {
        const eye = mons.find(m => m.mname === "floating eye");
        expect(eye).toBeDefined();

        expect(MD.is_floater(eye)).toBe(true);
        expect(MD.amphibious(eye)).toBe(true);
        expect(MD.is_flyer(eye)).toBe(true);

        // Assert absence of other flags
        expect(MD.is_animal(eye)).toBe(false);
        expect(MD.is_swimmer(eye)).toBe(false);
        expect(MD.is_undead(eye)).toBe(false);
        expect(MD.is_demon(eye)).toBe(false);
        expect(MD.passes_walls(eye)).toBe(false);
        expect(MD.tunnels(eye)).toBe(false);
    });

    it('vampire bat correctly resolves flags', () => {
        const bat = mons.find(m => m.mname === "vampire bat");
        expect(bat).toBeDefined();

        expect(MD.is_flyer(bat)).toBe(true);
        expect(MD.is_animal(bat)).toBe(true);
        expect(MD.nohands(bat)).toBe(true);

        expect(MD.amphibious(bat)).toBe(false);
        expect(MD.is_swimmer(bat)).toBe(false);
        expect(MD.is_floater(bat)).toBe(false);
    });

    it('xorn correctly resolves flags', () => {
        const xorn = mons.find(m => m.mname === "xorn");
        expect(xorn).toBeDefined();

        expect(MD.passes_walls(xorn)).toBe(true);

        expect(MD.is_animal(xorn)).toBe(false);
        expect(MD.is_flyer(xorn)).toBe(false);
    });

    it('water demon correctly resolves flags', () => {
        const demon = mons.find(m => m.mname === "water demon");
        expect(demon).toBeDefined();

        expect(MD.is_demon(demon)).toBe(true);
        expect(MD.is_swimmer(demon)).toBe(true);

        expect(MD.is_animal(demon)).toBe(false);
        expect(MD.is_flyer(demon)).toBe(false);
        expect(MD.passes_walls(demon)).toBe(false);
    });
});
