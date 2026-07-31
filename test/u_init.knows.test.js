import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { knows_class, knows_object, discover_object } from '../js/u_init.js';
import { game, resetGame } from '../js/gstate.js';
import { bases, init_objects } from '../js/o_init.js';
import { objects } from '../js/objects.js';
import { WEAPON_CLASS, ARMOR_CLASS, P_POLEARMS, P_LANCE, P_BOW, P_CROSSBOW, P_SPEAR, P_DAGGER, PM_ROGUE, PM_RANGER, PM_KNIGHT, PM_SAMURAI } from '../js/const.js';
import { initRng } from '../js/rng.js';

describe('u_init knows_object / knows_class', () => {
    let originalObjects = [];

    beforeEach(() => {
        resetGame();
        initRng(12345n);
        game.u = {
            uroleplay: { pauper: false }
        };
        game.urole = { mnum: 0 };

        // Save original objects state
        originalObjects = objects.map(o => ({ ...o }));

        // ensure bases are initialized so we can loop properly
        init_objects();

        for (let i = 0; i < objects.length; i++) {
            if (objects[i]) objects[i].oc_name_known = 0;
        }
    });

    afterEach(() => {
        // Restore objects
        for (let i = 0; i < objects.length; i++) {
            Object.assign(objects[i], originalObjects[i]);
        }
        vi.restoreAllMocks();
    });

    it('knows_object calls discover_object and modifies objects state', () => {
        game.u.uroleplay.pauper = false;

        let otyp = bases[ARMOR_CLASS];
        expect(objects[otyp].oc_name_known).toBeFalsy();

        knows_object(otyp, false);

        expect(objects[otyp].oc_name_known).toBeTruthy();
    });

    it('knows_object respects pauper override', () => {
        game.u.uroleplay.pauper = true;
        let otyp = bases[ARMOR_CLASS] + 1;

        knows_object(otyp, false);
        expect(objects[otyp].oc_name_known).toBeFalsy(); // Should not be known

        knows_object(otyp, true);
        expect(objects[otyp].oc_name_known).toBeTruthy(); // Should be known because of override
    });

    it('knows_class identifies correct weapons for PM_ROGUE', () => {
        game.urole.mnum = PM_ROGUE;

        knows_class(WEAPON_CLASS);

        for (let ct = bases[WEAPON_CLASS]; ct < bases[WEAPON_CLASS + 1]; ct++) {
            if (objects[ct].oc_magic) continue; // non-magic only
            let oc_skill = objects[ct].oc_subtyp;

            if (oc_skill === P_DAGGER) {
                expect(objects[ct].oc_name_known).toBeTruthy();
            } else {
                expect(objects[ct].oc_name_known).toBeFalsy();
            }
        }
    });

    it('knows_class identifies correct weapons for PM_RANGER', () => {
        game.urole.mnum = PM_RANGER;

        knows_class(WEAPON_CLASS);

        for (let ct = bases[WEAPON_CLASS]; ct < bases[WEAPON_CLASS + 1]; ct++) {
            if (objects[ct].oc_magic) continue;
            let oc_skill = objects[ct].oc_subtyp;
            let is_launcher = (oc_skill >= P_BOW && oc_skill <= P_CROSSBOW);
            let is_ammo = (oc_skill >= -P_CROSSBOW && oc_skill <= -P_BOW);
            let is_spear = (oc_skill === P_SPEAR);

            if (is_launcher || is_ammo || is_spear) {
                expect(objects[ct].oc_name_known).toBeTruthy();
            } else {
                expect(objects[ct].oc_name_known).toBeFalsy();
            }
        }
    });

    it('knows_class identifies correct weapons for PM_KNIGHT (can see polearms)', () => {
        game.urole.mnum = PM_KNIGHT;

        knows_class(WEAPON_CLASS);

        let foundPolearm = false;
        for (let ct = bases[WEAPON_CLASS]; ct < bases[WEAPON_CLASS + 1]; ct++) {
            if (objects[ct].oc_magic) continue;
            let oc_skill = objects[ct].oc_subtyp;
            let is_pole = (oc_skill === P_POLEARMS || oc_skill === P_LANCE);

            if (is_pole) {
                expect(objects[ct].oc_name_known).toBeTruthy();
                foundPolearm = true;
            }
        }
        expect(foundPolearm).toBe(true);
    });

    it('knows_class identifies correct weapons for normal role (cannot see polearms)', () => {
        game.urole.mnum = 0; // Archeologist

        knows_class(WEAPON_CLASS);

        let foundPolearm = false;
        for (let ct = bases[WEAPON_CLASS]; ct < bases[WEAPON_CLASS + 1]; ct++) {
            if (objects[ct].oc_magic) continue;
            let oc_skill = objects[ct].oc_subtyp;
            let is_pole = (oc_skill === P_POLEARMS || oc_skill === P_LANCE);

            if (is_pole) {
                expect(objects[ct].oc_name_known).toBeFalsy();
                foundPolearm = true;
            }
        }
        expect(foundPolearm).toBe(true);
    });
});
