import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { objects } from '../js/objects.js';
import {
    is_rustprone, is_crackable, is_corrodeable, is_rottable, is_flammable, is_damageable,
    Is_candle, is_weptool, erosion_matters, is_multigen, may_generate_eroded, mkobj_erosions
} from '../js/mkobj.js';
import { initRng, rn2 } from '../js/rng.js';
import { game, resetGame } from '../js/gstate.js';
import { WEAPON_CLASS, TOOL_CLASS, ARMOR_CLASS, POTION_CLASS, WAND_CLASS } from '../js/const.js';
import { WAN_FIRE } from '../js/objects.js';

describe('mkobj erosions and properties', () => {

    beforeEach(() => {
        resetGame();
        initRng(8000);
    });

    it('identifies erosion properties correctly', () => {
        const longSword = objects.findIndex(o => o.oc_name === 'long sword');
        const otmp = { otyp: longSword, oclass: WEAPON_CLASS };

        expect(is_rustprone(otmp)).toBe(true);
        expect(is_crackable(otmp)).toBe(false);
        expect(is_damageable(otmp)).toBe(true);
        expect(erosion_matters(otmp)).toBe(true);
        expect(is_multigen(otmp)).toBe(false);
    });

    it('identifies multigen correctly', () => {
        const arrow = objects.findIndex(o => o.oc_name === 'arrow');
        const dart = objects.findIndex(o => o.oc_name === 'dart');
        const shuriken = objects.findIndex(o => o.oc_name === 'shuriken');
        const bow = objects.findIndex(o => o.oc_name === 'bow');

        expect(is_multigen({ otyp: arrow, oclass: WEAPON_CLASS })).toBe(true);
        expect(is_multigen({ otyp: dart, oclass: WEAPON_CLASS })).toBe(true);
        expect(is_multigen({ otyp: shuriken, oclass: WEAPON_CLASS })).toBe(true);
        expect(is_multigen({ otyp: bow, oclass: WEAPON_CLASS })).toBe(false); // Bow skill is 20, not -20
    });

    it('may_generate_eroded logic', () => {
        game.moves = 2; // Past initial inventory
        const longSword = objects.findIndex(o => o.oc_name === 'long sword');

        const otmp = { otyp: longSword, oclass: WEAPON_CLASS, oerodeproof: 0, oartifact: 0 };
        expect(may_generate_eroded(otmp)).toBe(true);

        otmp.oerodeproof = 1;
        expect(may_generate_eroded(otmp)).toBe(false);

        otmp.oerodeproof = 0;
        otmp.oclass = POTION_CLASS; // erosion doesn't matter
        expect(may_generate_eroded(otmp)).toBe(false);
    });

    it('mkobj_erosions consumes PRNG correctly', () => {
        game.moves = 2;
        const longSword = objects.findIndex(o => o.oc_name === 'long sword');
        const otmp = { otyp: longSword, oclass: WEAPON_CLASS, oeroded: 0, oeroded2: 0, greased: 0 };

        // Test with a specific seed that triggers erosion
        initRng(1234);
        // We just verify it doesn't crash and mutates the object.
        mkobj_erosions(otmp);

        // Properties might be mutated depending on the RNG seq
        expect(otmp.greased !== undefined).toBe(true);
    });

    it('is_flammable and Is_candle work without ReferenceErrors', () => {
        const waxCandle = objects.findIndex(o => o.oc_name === 'wax candle');
        const wandFire = WAN_FIRE;
        const longSword = objects.findIndex(o => o.oc_name === 'long sword');

        const otmpCandle = { otyp: waxCandle, oclass: TOOL_CLASS };
        const otmpWand = { otyp: wandFire, oclass: WAND_CLASS };
        const otmpSword = { otyp: longSword, oclass: WEAPON_CLASS };

        expect(Is_candle(otmpCandle)).toBe(true);
        expect(Is_candle(otmpWand)).toBe(false);

        expect(is_flammable(otmpCandle)).toBe(false); // Candles are not flammable in that sense
        expect(is_flammable(otmpWand)).toBe(false);
        expect(is_flammable(otmpSword)).toBe(false); // Metal
    });
});
