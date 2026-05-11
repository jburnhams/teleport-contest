import { describe, it, expect, beforeEach } from 'vitest';
import { newobj, bless, curse, unbless, uncurse, blessorcurse, bcsign } from '../js/mkobj.js';
import { initRng, getRngLog, enableRngLog } from '../js/rng.js';
import { COIN_CLASS, WEAPON_CLASS } from '../js/const.js';

describe('BUC assignment', () => {
    let obj;

    beforeEach(() => {
        obj = newobj();
        obj.oclass = WEAPON_CLASS;
    });

    it('bless sets blessed and unsets cursed', () => {
        obj.cursed = 1;
        bless(obj);
        expect(obj.blessed).toBe(1);
        expect(obj.cursed).toBe(0);
    });

    it('bless ignores COIN_CLASS', () => {
        obj.oclass = COIN_CLASS;
        bless(obj);
        expect(obj.blessed).toBe(0);
    });

    it('unbless unsets blessed', () => {
        obj.blessed = 1;
        unbless(obj);
        expect(obj.blessed).toBe(0);
    });

    it('curse sets cursed and unsets blessed', () => {
        obj.blessed = 1;
        curse(obj);
        expect(obj.blessed).toBe(0);
        expect(obj.cursed).toBe(1);
    });

    it('curse ignores COIN_CLASS', () => {
        obj.oclass = COIN_CLASS;
        curse(obj);
        expect(obj.cursed).toBe(0);
    });

    it('uncurse unsets cursed', () => {
        obj.cursed = 1;
        uncurse(obj);
        expect(obj.cursed).toBe(0);
    });

    it('bcsign returns 1 for blessed, -1 for cursed, 0 for neither', () => {
        expect(bcsign(obj)).toBe(0);

        obj.blessed = 1;
        expect(bcsign(obj)).toBe(1);

        obj.blessed = 0;
        obj.cursed = 1;
        expect(bcsign(obj)).toBe(-1);
    });

    it('blessorcurse consumes rng in the correct order', () => {
        // Initialize with a known seed where we know exactly the sequence rn2(10) returns
        // Seed 1, initial random values
        initRng(1);
        enableRngLog();

        // This rng uses 2 calls depending on chance, first is rn2(chance)
        // If it passes (chance = 10 for instance, random < 10 but !rn2 is checking if it is 0)
        // So it only triggers if rn2(10) == 0.
        blessorcurse(obj, 10);

        // Let's force it by passing chance = 1, rn2(1) always returns 0
        blessorcurse(obj, 1);

        const log = getRngLog();
        expect(log.length).toBeGreaterThan(0);
        expect(log[log.length-2]).toBe('rn2(1)=0');
        expect(log[log.length-1]).toMatch(/^rn2\(2\)=/);

        // It should either be blessed or cursed depending on rn2(2) result
        expect(obj.blessed || obj.cursed).toBe(1);
    });
});
