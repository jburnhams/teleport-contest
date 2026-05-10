import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rhack } from '../js/cmd.js';
import { game, resetGame } from '../js/gstate.js';
import { GameMap } from '../js/game.js';
import { init_vision_globals, vision_reset, vision_recalc } from '../js/vision.js';
import { ROOM } from '../js/const.js';
import { pushKeys, resetInputState } from '../js/input.js';

describe('cmd.js', () => {
    beforeEach(() => {
        resetGame();
        resetInputState();
        init_vision_globals();
        game.level = new GameMap();
        for (let y = 0; y < 21; y++) {
            for (let x = 1; x < 80; x++) {
                game.level.at(x, y).typ = ROOM;
            }
        }
        game.u = { ux: 10, uy: 10, ux0: 10, uy0: 10 };
        game.context = { move: 0 };
        vision_reset();
        vision_recalc();
    });

    it('moves the hero with h/j/k/l keys', async () => {
        await rhack('l'.charCodeAt(0));
        expect(game.u.ux).toBe(11);
        expect(game.u.uy).toBe(10);
        expect(game.context.move).toBe(1);
    });

    it('handles spells with "+"', async () => {
        pushKeys(' '); // Space to dismiss message
        await rhack('+'.charCodeAt(0));
        expect(game.context.move).toBe(0);
    });

    it('handles looking with ":"', async () => {
        pushKeys(' '); // Space to dismiss message
        await rhack(':'.charCodeAt(0));
        expect(game.context.move).toBe(0);
    });

    it('handles attribute display with Ctrl+X', async () => {
        // Mock nhDisplay
        game.nhDisplay = {
            clearScreen: vi.fn(),
            putstr: vi.fn(),
            setCursor: vi.fn()
        };
        
        pushKeys('  '); // Two spaces for two pages
        // Ctrl+X is 0x18
        await rhack(0x18);
        
        expect(game.nhDisplay.clearScreen).toHaveBeenCalled();
        expect(game.nhDisplay.putstr).toHaveBeenCalled();
    });

    it('handles blocking movement', async () => {
        game.level.at(11, 10).typ = 1; // Wall
        await rhack('l'.charCodeAt(0));
        expect(game.u.ux).toBe(10); // Didn't move
        expect(game.context.move).toBe(0);
    });
});
