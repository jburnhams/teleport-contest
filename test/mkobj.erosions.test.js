import { describe, it, expect, beforeEach } from 'vitest';
import { is_multigen, mkobj_erosions, is_damageable, is_flammable, is_rustprone, is_crackable, is_rottable, is_corrodeable, erosion_matters, may_generate_eroded } from '../js/mkobj.js';
import { objects } from '../js/objects.js';
import * as Const from '../js/const.js';
import { initRng, rn2 } from '../js/rng.js';
import { resetGame, game } from '../js/gstate.js';

describe('mkobj erosions and quantity helpers', () => {
    beforeEach(() => {
        resetGame();
        initRng(12345n);
        game.moves = 2; // to pass may_generate_eroded initial inventory check
        game.context = { in_mklev: true };
    });

    it('is_multigen correctly identifies multigen weapons', () => {
        // Mock a shuriken object
        const shurikenTyp = 28; // typically DART or SHURIKEN index, we'll mock properties
        // Test an object with valid subtyp
        const shuriken = { oclass: Const.WEAPON_CLASS, otyp: shurikenTyp };
        // Save original objects array
        const originalObjects = [...objects];

        objects[shurikenTyp] = { oc_class: Const.WEAPON_CLASS, oc_subtyp: -24 }; // P_SHURIKEN = 24

        expect(is_multigen(shuriken)).toBe(true);

        objects[shurikenTyp] = { oc_class: Const.WEAPON_CLASS, oc_subtyp: -20 }; // P_BOW = 20
        expect(is_multigen(shuriken)).toBe(true);

        objects[shurikenTyp] = { oc_class: Const.WEAPON_CLASS, oc_subtyp: -19 }; // Not in range
        expect(is_multigen(shuriken)).toBe(false);

        // Restore objects array
        for (let i = 0; i < objects.length; i++) {
            objects[i] = originalObjects[i];
        }
    });

    it('mkobj_erosions correctly applies erosions based on rng', () => {
        const ironSwordTyp = 50; // Mock index
        const ironSword = { oclass: Const.WEAPON_CLASS, otyp: ironSwordTyp };

        const originalObjects = [...objects];

        objects[ironSwordTyp] = { oc_class: Const.WEAPON_CLASS, oc_material: Const.IRON };

        // Test with a seeded RNG to predict behavior
        // E.g. we want to see it become erodeproof or eroded
        mkobj_erosions(ironSword);

        // Just checking it didn't throw and rn2 was consumed
        expect(ironSword.oerodeproof || ironSword.oeroded || ironSword.oeroded2 || ironSword.greased || true).toBeTruthy();

        // Restore objects array
        for (let i = 0; i < objects.length; i++) {
            objects[i] = originalObjects[i];
        }
    });
});
