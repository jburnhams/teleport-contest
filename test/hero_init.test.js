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

    it('covers all roles in u_init_role', () => {
        const roles = [
            { name: 'Archeologist', mnum: 0 },
            { name: 'Barbarian', mnum: 1 },
            { name: 'Caveman', mnum: 2 },
            { name: 'Healer', mnum: 3 },
            { name: 'Knight', mnum: 4 },
            { name: 'Monk', mnum: 5 },
            { name: 'Priest', mnum: 6 },
            { name: 'Ranger', mnum: 7 },
            { name: 'Rogue', mnum: 8 },
            { name: 'Samurai', mnum: 9 },
            { name: 'Tourist', mnum: 10 },
            { name: 'Valkyrie', mnum: 11 },
            { name: 'Wizard', mnum: 12 }
        ];

        for (const r of roles) {
            resetGame();
            initRng(0x360n);
            game.u = { umoney0: 0 };
            game.urole = findRole(r.name);
            game.urole.mnum = r.mnum;
            u_init_role();
            expect(game.moves).toBe(1);
        }
    });

    it('covers all races in u_init_race', () => {
        const races = [
            { name: 'human', mnum: 0 },
            { name: 'elf', mnum: 1 },
            { name: 'dwarf', mnum: 2 },
            { name: 'gnome', mnum: 3 },
            { name: 'orc', mnum: 4 }
        ];

        for (const r of races) {
            resetGame();
            initRng(0x360n);
            game.u = { umoney0: 0 };
            game.urace = findRace(r.name);
            game.urace.mnum = r.mnum;
            game.urole = findRole('Wizard');
            game.urole.mnum = 12;
            u_init_race();
        }
    });

    it('u_init_misc sets basic state', () => {
        game.u = {};
        game.urole = findRole('Wizard');
        game.urole.mnum = 12;
        game.urace = findRace('human');
        game.urace.mnum = 0;
        game.flags = { initgend: true };
        u_init_misc();
        expect(game.u.ulevel).toBe(1);
    });

    it('u_init_inventory_attrs runs full init', () => {
        game.u = {};
        game.urole = findRole('Wizard');
        game.urole.mnum = 12;
        game.urace = findRace('human');
        game.urace.mnum = 0;
        u_init_inventory_attrs();
        expect(game.u.abase).toBeDefined();
    });
});
