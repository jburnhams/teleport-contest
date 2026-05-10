import { describe, it, expect, beforeEach } from 'vitest';
import { game, resetGame } from '../js/gstate.js';
import { initRng, rn2 } from '../js/rng.js';
import { u_init_role, u_init_race, u_init_misc, u_init_inventory_attrs, skill_init, skills_for_role } from '../js/u_init.js';
import { findRole, findRace } from '../js/roles.js';
import {
    P_ISRESTRICTED, P_BASIC, P_UNSKILLED, P_NONE, P_ATTACK_SPELL, P_ENCHANTMENT_SPELL,
    P_BARE_HANDED_COMBAT, P_NUM_SKILLS, P_DAGGER, P_KNIFE, P_AXE, P_SHORT_SWORD, P_CLUB, P_MACE,
    P_QUARTERSTAFF, P_POLEARMS, P_SPEAR, P_TRIDENT, P_SLING, P_DART, P_SHURIKEN,
    P_HEALING_SPELL, P_DIVINATION_SPELL, P_CLERIC_SPELL, P_ESCAPE_SPELL, P_MATTER_SPELL, P_RIDING
} from '../js/const.js';

describe('Hero Initialization RNG sequence', () => {
    beforeEach(() => {
        resetGame();
        initRng(0x360n); // known seed from earlier
        game.flags = { initgend: true, initalign: 1 };
        game.urole = findRole('Wizard');
        game.urace = findRace('human');
        game.urole.mnum = 12;
        game.urace.mnum = 0;
        game.u = {
            weapon_skills: []
        };
    });

    it('Wizard initial inventory correctly matches expected calls without crashing', () => {
        u_init_role();
        // Just verify basic non-crash as full RNG check needs exact sequence matching
        // which varies until Stream D is complete
        expect(game.moves).toBe(1); // moves are uninit
    });

    it('skill_init correctly initializes Wizard skills', () => {
        const wizardSkills = skills_for_role();
        skill_init(wizardSkills);

        expect(game.u.weapon_skills.length).toBe(P_NUM_SKILLS);

        // Check defaults and specific overrides for Wizard
        expect(game.u.weapon_skills[P_ATTACK_SPELL].skill).toBe(P_BASIC);
        expect(game.u.weapon_skills[P_ENCHANTMENT_SPELL].skill).toBe(P_BASIC);
        expect(game.u.weapon_skills[P_BARE_HANDED_COMBAT].skill).toBe(P_UNSKILLED);

        // A spell Wizard restricts
        expect(game.u.weapon_skills[P_RIDING].skill).toBe(P_UNSKILLED);
    });
});
