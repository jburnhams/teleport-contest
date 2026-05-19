import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initRng, enableRngLog, getRngLog } from '../js/rng.js';
import { game, resetGame } from '../js/gstate.js';
import {
    mkobj_erosions,
    may_generate_eroded,
    is_multigen,
    is_flammable,
    is_rustprone,
    is_crackable,
    is_rottable,
    is_corrodeable,
    is_damageable,
    Is_candle
} from '../js/mkobj.js';
import { erosion_matters } from '../js/objnam.js';
import { objects, WORM_TOOTH, WAN_FIRE, TALLOW_CANDLE, WAX_CANDLE } from '../js/objects.js';
import { ARMOR_CLASS, WEAPON_CLASS, TOOL_CLASS } from '../js/const.js';
import { WOOD, IRON, GLASS, COPPER, PLASTIC, FIRE_RES, P_SHURIKEN, P_BOW } from '../js/const.js';

describe('mkobj_erosions and helpers', () => {
    beforeEach(() => {
        resetGame();
        game.moves = 2; // move > 1
        game.in_mklev = true; // just to be absolutely sure
        initRng(12345);
        enableRngLog();
    });

    afterEach(() => {
        enableRngLog(false);
    });

    it('should correctly evaluate may_generate_eroded', () => {
        // Mock a basic sword (iron, damageable)
        const sword = {
            otyp: 1, // Let's assume some index, we'll manually set objects[1] temporarily or mock
            oclass: WEAPON_CLASS,
            oerodeproof: 0,
            oartifact: 0,
        };
        // Mock objects[1] to be iron
        const origObj = objects[1];
        objects[1] = { oc_material: IRON };

        expect(may_generate_eroded(sword)).toBe(true);

        sword.oerodeproof = 1;
        expect(may_generate_eroded(sword)).toBe(false);
        sword.oerodeproof = 0;

        sword.otyp = WORM_TOOTH;
        expect(may_generate_eroded(sword)).toBe(false);

        sword.otyp = 120;
        objects[120] = { oc_subtyp: 27 }; // Mock P_UNICORN_HORN
        expect(may_generate_eroded(sword)).toBe(false);
        objects[120] = undefined; // restore

        sword.otyp = 1;
        sword.oartifact = 1;
        expect(may_generate_eroded(sword)).toBe(false);
        sword.oartifact = 0;

        objects[1] = origObj; // restore
    });

    it('should accurately detect damageable flags', () => {
        const item = { otyp: 2, oclass: WEAPON_CLASS };
        const origObj = objects[2];

        // test rustprone
        objects[2] = { oc_material: IRON };
        expect(is_rustprone(item)).toBe(true);
        expect(is_damageable(item)).toBe(true);

        // test flammable
        objects[2] = { oc_material: WOOD, oc_oprop: 0 };
        expect(is_flammable(item)).toBe(true);
        expect(is_damageable(item)).toBe(true);

        objects[2] = { oc_material: WOOD, oc_oprop: FIRE_RES };
        expect(is_flammable(item)).toBe(false);

        objects[2] = { oc_material: PLASTIC, oc_oprop: 0 };
        expect(is_flammable(item)).toBe(true);

        // test crackable
        objects[2] = { oc_material: GLASS };
        item.oclass = ARMOR_CLASS;
        expect(is_crackable(item)).toBe(true);
        expect(is_damageable(item)).toBe(true);
        item.oclass = WEAPON_CLASS;
        expect(is_crackable(item)).toBe(false);

        // test corrodeable
        objects[2] = { oc_material: COPPER };
        expect(is_corrodeable(item)).toBe(true);
        expect(is_damageable(item)).toBe(true);

        // Is_candle
        item.otyp = TALLOW_CANDLE;
        expect(Is_candle(item)).toBe(true);
        item.otyp = WAX_CANDLE;
        expect(Is_candle(item)).toBe(true);

        objects[2] = origObj; // restore
    });

    it('should correctly consume RNG calls in mkobj_erosions', () => {
        const item = {
            otyp: 3,
            oclass: WEAPON_CLASS,
            oerodeproof: 0,
            oeroded: 0,
            oeroded2: 0,
            greased: 0
        };
        const origObj = objects[3];
        // Iron weapon: rustprone and corrodeable.
        objects[3] = { oc_material: IRON, oc_oprop: 0 };

        // Test with a known seed.
        // We know mkobj_erosions does: rn2(100) -> if > 0: rn2(80), rn2(9) ... rn2(1000)
        // With rn2(100) we need to test both branches.
        // Let's seed such that rn2(100) is > 0 to enter erosion block.
        // For 12345: rn2(100) -> we'll log it.
        initRng(12345);
        mkobj_erosions(item);

        const logs = getRngLog();
        expect(logs.length).toBeGreaterThan(0);
        // Ensure properties changed. With real rng, we can't assume exactly
        // without tracing, but we know it consumes rng.
        // For a full bit-exact test, we assert the log matches the known call trace.
        // A simple snapshot or length check ensures the sequence was consumed.
        expect(logs[0]).toBe('100@rn2');

        objects[3] = origObj;
    });

    it('should determine is_multigen correctly', () => {
        const item = { otyp: 4, oclass: WEAPON_CLASS };
        const origObj = objects[4];

        objects[4] = { oc_skill: -P_SHURIKEN };
        expect(is_multigen(item)).toBe(true);

        objects[4] = { oc_skill: -P_BOW };
        expect(is_multigen(item)).toBe(true);

        objects[4] = { oc_skill: 1 };
        expect(is_multigen(item)).toBe(false);

        item.oclass = ARMOR_CLASS;
        objects[4] = { oc_skill: -P_SHURIKEN };
        expect(is_multigen(item)).toBe(false);

        objects[4] = origObj;
    });

    it('should determine erosion_matters correctly', () => {
        expect(erosion_matters({ oclass: WEAPON_CLASS })).toBe(true);
        expect(erosion_matters({ oclass: ARMOR_CLASS })).toBe(true);
        objects[1] = { oc_skill: 0 }; // P_NONE
        expect(erosion_matters({ oclass: TOOL_CLASS, otyp: 1 })).toBe(false);
        objects[1] = { oc_skill: 27 }; // P_UNICORN_HORN
        expect(erosion_matters({ oclass: TOOL_CLASS, otyp: 1 })).toBe(true);
    });
});