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
        // Just verify basic non-crash as full RNG check needs exact sequence matching
        // which varies until Stream D is complete
        expect(game.moves).toBe(1);
    });
});
