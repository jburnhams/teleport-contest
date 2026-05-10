import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pick_role, pick_race, pick_gend, pick_align, ROLE_NONE, askname, tty_player_selection } from '../js/chargen.js';
import { initRng, enableRngLog } from '../js/rng.js';
import { resetGame, game } from '../js/gstate.js';
import * as input from '../js/input.js';

describe('chargen.js static logic', () => {
    beforeEach(() => {
        resetGame();
        initRng(8000);
        enableRngLog();
    });

    it('pick_role respects constraints', () => {
        // Valkyrie must be human or dwarf, and female (in most cases, but let's check role.c/js)
        // Actually Valkyrie in NetHack 3.6.x is female-only, let's check our constants.
        // ROLE_ALLOW[11] = MH_HUMAN|MH_DWARF|ROLE_FEMALE|ROLE_LAWFUL|ROLE_NEUTRAL
        
        const role = pick_role(1 /* elf */, -1, -1, 0);
        // Elves cannot be Valkyries (11).
        expect(role).not.toBe(11);
    });

    it('pick_race respects constraints', () => {
        // Samurai (9) must be human.
        const race = pick_race(9, -1, -1, 0);
        expect(race).toBe(0); // human
    });

    it('pick_gend respects constraints', () => {
        // Valkyrie (11) must be female (1).
        const gend = pick_gend(11, -1, -1, 0);
        expect(gend).toBe(1);
    });

    it('pick_align respects constraints', () => {
        // Knight (4) must be lawful (2).
        const align = pick_align(4, -1, -1, 0);
        expect(align).toBe(2);
    });

    it('askname captures user input', async () => {
        const mockNhgetch = vi.spyOn(input, 'nhgetch')
            .mockResolvedValueOnce('B'.charCodeAt(0))
            .mockResolvedValueOnce('o'.charCodeAt(0))
            .mockResolvedValueOnce('b'.charCodeAt(0))
            .mockResolvedValueOnce('\r'.charCodeAt(0));

        const g = { plname: '' };
        await askname(g);
        expect(g.plname).toBe('Bob');
        mockNhgetch.mockRestore();
    });

    it('tty_player_selection handles "pick for me" [y]', async () => {
        const mockNhgetch = vi.spyOn(input, 'nhgetch')
            // askname: "Hero\r"
            .mockResolvedValueOnce('H'.charCodeAt(0))
            .mockResolvedValueOnce('\r'.charCodeAt(0))
            // Shall I pick? "y"
            .mockResolvedValueOnce('y'.charCodeAt(0))
            // Is this ok? "y"
            .mockResolvedValueOnce('y'.charCodeAt(0));

        const g = { plname: '' };
        const result = await tty_player_selection(g);
        expect(result).not.toBeNull();
        expect(result.role).toBeGreaterThanOrEqual(0);
        mockNhgetch.mockRestore();
    });
});
