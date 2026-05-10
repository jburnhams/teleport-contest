import { describe, it, expect, beforeEach, vi } from 'vitest';
import { newsym, docrt, show_glyph_cell, flush_screen, bot } from '../js/display.js';
import { pline } from '../js/pline.js';
import { game, resetGame } from '../js/gstate.js';
import { GameMap } from '../js/game.js';
import { init_vision_globals, vision_reset, vision_recalc } from '../js/vision.js';
import { ROOM, STONE } from '../js/const.js';

describe('display.js', () => {
    beforeEach(() => {
        resetGame();
        init_vision_globals();
        game.level = new GameMap();
        for (let y = 0; y < 21; y++) {
            for (let x = 1; x < 80; x++) {
                game.level.at(x, y).typ = ROOM;
                game.level.at(x, y).lit = true;
            }
        }
        game.u = { ux: 10, uy: 10, acurr: { a: [] } };
        game.urole = { rank: { m: 'Hero' } };
        vision_reset();
        vision_recalc();
    });

    it('newsym updates cell display data for visible cells', () => {
        newsym(11, 10);
        const loc = game.level.at(11, 10);
        expect(loc.disp_ch).toBe('~'); // ROOM glyph
        expect(loc.gnew).toBe(1);
    });

    it('newsym shows hero at hero position', () => {
        newsym(10, 10);
        const loc = game.level.at(10, 10);
        expect(loc.disp_ch).toBe('@');
    });

    it('pline sets pending message', () => {
        pline('Hello world');
        expect(game._pending_message).toBe('Hello world');
    });

    it('docrt refreshes all remembered glyphs', async () => {
        const loc = game.level.at(12, 10);
        loc.remembered_glyph = { ch: '?', color: 7, decgfx: false };
        
        await docrt();
        expect(loc.disp_ch).toBe('?');
    });

    it('show_glyph_cell sets raw display data', () => {
        show_glyph_cell(5, 5, 'K', 1, false);
        const loc = game.level.at(5, 5);
        expect(loc.disp_ch).toBe('K');
        expect(loc.disp_color).toBe(1);
    });
});
