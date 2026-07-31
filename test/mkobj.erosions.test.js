import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as mkobj from '../js/mkobj.js';
import * as objnam from '../js/objnam.js';
import * as Const from '../js/const.js';
import { objects } from '../js/objects.js';
import { game } from '../js/gstate.js';
import { initRng, enableRngLog, getRngLog } from '../js/rng.js';

describe('erosion and quantity helpers', () => {

    beforeEach(() => {
        game.moves = 2; // to bypass initial inventory check
        game.in_mklev = false;

        // Use real PRNG with a known seed
        initRng(0);
        enableRngLog();
    });

    afterEach(() => {
        // Any reset logic if needed
    });

    it('should correctly identify flammable objects', () => {
        // TALLOW_CANDLE is not flammable by definition in NetHack
        let obj1 = { otyp: Const.TALLOW_CANDLE };
        expect(mkobj.is_flammable(obj1)).toBe(false);
    });

    it('may_generate_eroded handles logic', () => {
        let obj = { otyp: Const.WORM_TOOTH };
        expect(mkobj.may_generate_eroded(obj)).toBe(false);

        obj = { otyp: Const.UNICORN_HORN };
        expect(mkobj.may_generate_eroded(obj)).toBe(false);

        obj = { oartifact: 1, otyp: 1, oclass: Const.WEAPON_CLASS };
        expect(mkobj.may_generate_eroded(obj)).toBe(false);
    });

    it('erosion_matters correctly filters', () => {
        let obj = { oclass: Const.WEAPON_CLASS };
        expect(objnam.erosion_matters(obj)).toBe(1);

        obj = { oclass: Const.ARMOR_CLASS };
        expect(objnam.erosion_matters(obj)).toBe(1);

        obj = { oclass: Const.BALL_CLASS };
        expect(objnam.erosion_matters(obj)).toBe(1);

        obj = { oclass: Const.CHAIN_CLASS };
        expect(objnam.erosion_matters(obj)).toBe(1);
    });

    it('mkobj_erosions correctly consumes RNG', () => {
        let ironWeaponIdx = objects.findIndex(o => o.oc_class === Const.WEAPON_CLASS && o.oc_material === Const.IRON);
        if (ironWeaponIdx !== -1) {
            let obj = { otyp: ironWeaponIdx, oclass: Const.WEAPON_CLASS, oeroded: 0, oeroded2: 0, greased: 0 };

            // With real rng seeded at 0, let's see what happens.
            // rn2(100) -> 0 means erodeproof=1.
            mkobj.mkobj_erosions(obj);

            // we could check the rng call log if we needed exact count assertion, e.g.
            expect(getRngLog().length).toBeGreaterThan(0);
        }
    });

    it('is_multigen correctly identifies multigen weapons', () => {
        let shurikenIdx = objects.findIndex(o => o.oc_class === Const.WEAPON_CLASS && o.oc_skill === -Const.P_SHURIKEN);
        if (shurikenIdx !== -1) {
            let obj = { otyp: shurikenIdx, oclass: Const.WEAPON_CLASS };
            expect(mkobj.is_multigen(obj)).toBe(true);
        }
    });
});
