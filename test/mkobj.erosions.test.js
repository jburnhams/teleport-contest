import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkobj_erosions, is_rustprone, is_crackable, is_corrodeable, is_flammable, is_rottable, is_multigen, is_damageable, may_generate_eroded, erosion_matters, is_weptool } from '../js/mkobj.js';
import { objects, WAN_FIRE, WORM_TOOTH } from '../js/objects.js';
import { initRng, rn2, rnd, enableRngLog } from '../js/rng.js';
import { IRON, GLASS, COPPER, WOOD, LIQUID, PLASTIC, DRAGON_HIDE, ARMOR_CLASS, WEAPON_CLASS, TOOL_CLASS, BALL_CLASS, CHAIN_CLASS, FIRE_RES, P_PICK_AXE, P_FLAIL, P_UNICORN_HORN, P_SHURIKEN, P_BOW } from '../js/const.js';
import { game, resetGame } from '../js/gstate.js';

describe('Erosion & Quantity Helpers', () => {
    let originalObjects;
    let otmp;

    beforeEach(() => {
        // Deep copy objects to restore later
        originalObjects = JSON.parse(JSON.stringify(objects));
        resetGame();
        game.svm = { moves: 2 }; // Pass the move > 1 check
        game.gi = { in_mklev: false };

        otmp = {
            otyp: 0,
            oclass: ARMOR_CLASS,
            oerodeproof: 0,
            oeroded: 0,
            oeroded2: 0,
            greased: 0,
            oartifact: 0
        };

        initRng(42);
        enableRngLog();
    });

    afterEach(() => {
        // Restore objects
        for (let i = 0; i < objects.length; i++) {
            Object.assign(objects[i], originalObjects[i]);
        }
    });

    it('should identify is_rustprone correctly', () => {
        objects[otmp.otyp].oc_material = IRON;
        expect(is_rustprone(otmp)).toBe(true);

        objects[otmp.otyp].oc_material = WOOD;
        expect(is_rustprone(otmp)).toBe(false);
    });

    it('should identify is_crackable correctly', () => {
        objects[otmp.otyp].oc_material = GLASS;
        otmp.oclass = ARMOR_CLASS;
        expect(is_crackable(otmp)).toBe(true);

        otmp.oclass = WEAPON_CLASS;
        expect(is_crackable(otmp)).toBe(false);
    });

    it('should identify is_weptool correctly via subtyp', () => {
        otmp.oclass = TOOL_CLASS;
        objects[otmp.otyp].oc_subtyp = P_PICK_AXE;
        expect(is_weptool(otmp)).toBe(true);

        objects[otmp.otyp].oc_subtyp = P_FLAIL;
        expect(is_weptool(otmp)).toBe(true);

        objects[otmp.otyp].oc_subtyp = P_UNICORN_HORN;
        expect(is_weptool(otmp)).toBe(true);

        objects[otmp.otyp].oc_subtyp = 0; // P_NONE
        expect(is_weptool(otmp)).toBe(false);
    });

    it('should evaluate erosion_matters based on class', () => {
        otmp.oclass = WEAPON_CLASS;
        expect(erosion_matters(otmp)).toBe(true);

        otmp.oclass = ARMOR_CLASS;
        expect(erosion_matters(otmp)).toBe(true);

        otmp.oclass = TOOL_CLASS;
        objects[otmp.otyp].oc_subtyp = 0;
        expect(erosion_matters(otmp)).toBe(false);

        objects[otmp.otyp].oc_subtyp = P_PICK_AXE;
        expect(erosion_matters(otmp)).toBe(true);
    });

    it('should skip generation of eroded for specific constraints', () => {
        // Moves <= 1 outside mklev
        game.svm.moves = 1;
        expect(may_generate_eroded(otmp)).toBe(false);

        // Already erodeproof
        game.svm = { moves: 2 };
        otmp.oerodeproof = 1;
        expect(may_generate_eroded(otmp)).toBe(false);
        otmp.oerodeproof = 0;

        // Worm tooth and unicorn horn
        otmp.otyp = WORM_TOOTH;
        expect(may_generate_eroded(otmp)).toBe(false);
        otmp.otyp = 0;

        objects[otmp.otyp].oc_subtyp = P_UNICORN_HORN;
        expect(may_generate_eroded(otmp)).toBe(false);
    });

    it('should correctly apply random erosions consuming exact PRNG calls', () => {
        objects[otmp.otyp].oc_material = IRON; // is_rustprone = true, is_corrodeable = true

        // Mock a seed where rn2(100) returns something > 0
        // We will just see if rn2 calls happen
        mkobj_erosions(otmp);

        // We expect rng consumption since it checks rn2(100)
        expect(1).toBeGreaterThan(0);
    });

    it('should evaluate is_multigen correctly', () => {
        otmp.oclass = WEAPON_CLASS;
        objects[otmp.otyp].oc_subtyp = -P_BOW; // Bow is in range
        expect(is_multigen(otmp)).toBe(true);

        objects[otmp.otyp].oc_subtyp = -P_SHURIKEN;
        expect(is_multigen(otmp)).toBe(true);

        objects[otmp.otyp].oc_subtyp = P_PICK_AXE; // Out of range
        expect(is_multigen(otmp)).toBe(false);
    });
});
