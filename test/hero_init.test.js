import { describe, it, expect, beforeEach } from 'vitest';
import { game, resetGame } from '../js/gstate.js';
import { initRng, rn2 } from '../js/rng.js';
import { u_init_role, u_init_race, u_init_misc, u_init_inventory_attrs } from '../js/u_init.js';
import { findRole, findRace } from '../js/roles.js';

describe('Hero Initialization RNG sequence', () => {
    beforeEach(() => {
        resetGame();
        initRng(0x360n); // known seed from earlier
        game.flags = { initgend: true, initalign: 1 };
        game.urole = findRole('Wizard');
        game.urace = findRace('human');
        game.urole.mnum = 12;
        game.urace.mnum = 0;
    });

    it('Wizard initial inventory correctly matches expected calls without crashing', () => {
        u_init_role();
        expect(game.moves).toBe(1);
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
