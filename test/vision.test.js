import { describe, it, expect, beforeEach } from 'vitest';
import { vision_reset, vision_recalc, cansee, couldsee, init_vision_globals } from '../js/vision.js';
import { game, resetGame } from '../js/gstate.js';
import { GameMap } from '../js/game.js';
import { ROOM, STONE, VWALL } from '../js/const.js';

describe('vision.js', () => {
    beforeEach(() => {
        resetGame();
        init_vision_globals();
        game.level = new GameMap();
        // Clear level to rooms
        for (let y = 0; y < 21; y++) {
            for (let x = 1; x < 80; x++) {
                const loc = game.level.at(x, y);
                loc.typ = ROOM;
                loc.lit = true;
            }
        }
        game.u = { ux: 10, uy: 10 };
    });

    it('identifies visible areas in an open room', () => {
        vision_reset();
        vision_recalc();
        expect(cansee(10, 10)).toBe(true);
        expect(cansee(15, 10)).toBe(true);
        expect(cansee(10, 15)).toBe(true);
    });

    it('respects blockages from walls', () => {
        // Place a wall between hero and target
        game.level.at(12, 10).typ = VWALL;
        
        vision_reset();
        vision_recalc();
        
        expect(cansee(11, 10)).toBe(true);
        expect(cansee(13, 10)).toBe(false);
    });

    it('updates vision when hero moves', () => {
        vision_reset();
        vision_recalc();
        expect(cansee(10, 10)).toBe(true);
        
        game.u.ux = 20;
        vision_recalc();
        expect(cansee(20, 10)).toBe(true);
    });

    it('handles couldsee for lit areas', () => {
        vision_reset();
        vision_recalc();
        expect(couldsee(10, 10)).toBe(true);
    });
});
