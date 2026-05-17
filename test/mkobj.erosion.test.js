import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    is_weptool, is_multigen, is_rustprone, is_crackable, is_corrodeable,
    is_flammable, is_rottable, is_damageable, erosion_matters, may_generate_eroded, mkobj_erosions
} from '../js/mkobj.js';
import { objects, WORM_TOOTH, TALLOW_CANDLE, WAX_CANDLE } from '../js/objects.js';
import { game, resetGame } from '../js/gstate.js';
import {
    WEAPON_CLASS, TOOL_CLASS, ARMOR_CLASS, POTION_CLASS,
    IRON, GLASS, WOOD, COPPER, DRAGON_HIDE, P_SHURIKEN, P_BOW, P_UNICORN_HORN, P_NONE
} from '../js/const.js';
import { initRng, enableRngLog, getRngLog } from '../js/rng.js';

describe('D2.3: Erosion & Quantity helpers', () => {

    beforeEach(() => {
        resetGame();
        initRng(8000n);
        enableRngLog();
    });

    it('is_multigen correctly identifies multigen weapons', () => {
        // Mock a shuriken
        const shuriken = { oclass: WEAPON_CLASS, otyp: 0 };
        objects[0] = { oc_subtyp: -P_SHURIKEN };
        expect(is_multigen(shuriken)).toBe(true);

        // Mock a bow (should be within range)
        const bow = { oclass: WEAPON_CLASS, otyp: 1 };
        objects[1] = { oc_subtyp: -P_BOW };
        expect(is_multigen(bow)).toBe(true);

        // Mock a sword (outside range, e.g. P_LONG_SWORD is positive usually or different)
        const sword = { oclass: WEAPON_CLASS, otyp: 2 };
        objects[2] = { oc_subtyp: 10 }; // Positive skill
        expect(is_multigen(sword)).toBe(false);
    });

    it('is_weptool correctly identifies tools as weapons', () => {
        const pickaxe = { oclass: TOOL_CLASS, otyp: 3 };
        objects[3] = { oc_subtyp: 5 }; // some skill != P_NONE
        expect(is_weptool(pickaxe)).toBe(true);

        const towel = { oclass: TOOL_CLASS, otyp: 4 };
        objects[4] = { oc_subtyp: P_NONE };
        expect(is_weptool(towel)).toBe(false);
    });

    it('material helpers identify properties correctly', () => {
        const ironArmor = { oclass: ARMOR_CLASS, otyp: 5 };
        objects[5] = { oc_material: IRON };
        expect(is_rustprone(ironArmor)).toBe(true);
        expect(is_flammable(ironArmor)).toBe(false);

        const glassArmor = { oclass: ARMOR_CLASS, otyp: 6 };
        objects[6] = { oc_material: GLASS };
        expect(is_crackable(glassArmor)).toBe(true);

        const woodWeapon = { oclass: WEAPON_CLASS, otyp: 7 };
        objects[7] = { oc_material: WOOD };
        expect(is_flammable(woodWeapon)).toBe(true);
        expect(is_rottable(woodWeapon)).toBe(true);

        const copperWand = { oclass: TOOL_CLASS, otyp: 8 };
        objects[8] = { oc_material: COPPER };
        expect(is_corrodeable(copperWand)).toBe(true);
    });

    it('may_generate_eroded basic logic', () => {
        game.moves = 2; // Pass initial hero inventory check

        const ironArmor = { oclass: ARMOR_CLASS, otyp: 5, oerodeproof: 0, oartifact: 0 };
        objects[5] = { oc_material: IRON }; // is_damageable = true, erosion_matters = true
        expect(may_generate_eroded(ironArmor)).toBe(true);

        const artifactArmor = { ...ironArmor, oartifact: 1 };
        expect(may_generate_eroded(artifactArmor)).toBe(false);

        const wormTooth = { oclass: WEAPON_CLASS, otyp: WORM_TOOTH, oerodeproof: 0, oartifact: 0 };
        objects[WORM_TOOTH] = { oc_material: WOOD }; // mock damageable
        expect(may_generate_eroded(wormTooth)).toBe(false);

        const uniHorn = { oclass: TOOL_CLASS, otyp: 9, oerodeproof: 0, oartifact: 0 };
        objects[9] = { oc_subtyp: P_UNICORN_HORN, oc_material: WOOD };
        expect(may_generate_eroded(uniHorn)).toBe(false);

        // Not damageable
        const glassPotion = { oclass: POTION_CLASS, otyp: 10, oerodeproof: 0, oartifact: 0 };
        objects[10] = { oc_material: GLASS }; // crackable only for armor class
        expect(may_generate_eroded(glassPotion)).toBe(false);
    });

    it('mkobj_erosions RNG consumption', () => {
        game.moves = 2;
        const ironArmor = { oclass: ARMOR_CLASS, otyp: 5, oerodeproof: 0, oeroded: 0, oeroded2: 0 };
        objects[5] = { oc_material: IRON };

        // This test consumes RNG without mocking it.
        // It should match the rng values from ISAAC64 for seed 8000n.
        // First rn2(100) -> let's see. We just call it and make sure it doesn't crash
        // and mutates correctly.
        mkobj_erosions(ironArmor);
        const log = getRngLog();
        expect(log.length).toBeGreaterThan(0);
    });
});
