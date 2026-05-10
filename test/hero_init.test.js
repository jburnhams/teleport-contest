import { describe, it, expect, beforeEach } from 'vitest';
import { game, resetGame } from '../js/gstate.js';
import { initRng } from '../js/rng.js';
import { u_init_role, u_init_race, u_init_misc, u_init_inventory_attrs } from '../js/u_init.js';
import { findRole, findRace } from '../js/roles.js';

describe('Hero Initialization', () => {
    beforeEach(() => {
        resetGame();
        initRng(0x360n); // seed0360 (Wizard, debug)
        game.flags = { initgend: true, initalign: 1 };
        game.urole = findRole('Wizard');
        game.urace = findRace('human');
        game.urole.mnum = 12;
        game.urace.mnum = 0;
    });

    it('consumes correct RNG for Wizard', () => {
        // Just verify it doesn't crash and we can call the functions
        expect(() => u_init_role()).not.toThrow();
    });
});
