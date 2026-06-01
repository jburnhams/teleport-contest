// C ref: topl.c
import { describe, it, expect, beforeEach } from 'vitest';
import { putmsghistory } from '../js/pline.js';
import { game, resetGame } from '../js/gstate.js';
import { GameDisplay } from '../js/game_display.js';

describe('putmsghistory', () => {
    beforeEach(() => {
        resetGame();
        game.nhDisplay = new GameDisplay(null);
    });

    it('pushes message to nhDisplay.messages without displaying', () => {
        expect(game.nhDisplay.messages.length).toBe(0);
        putmsghistory('Old message 1', true);
        putmsghistory('Old message 2', true);

        expect(game.nhDisplay.messages.length).toBe(2);
        expect(game.nhDisplay.messages[0]).toBe('Old message 1');
        expect(game.nhDisplay.messages[1]).toBe('Old message 2');
        expect(game.nhDisplay.toplin).toBe(0); // Should not change toplin
    });

    it('ignores null or empty messages', () => {
        putmsghistory(null, true);
        putmsghistory('', true);
        expect(game.nhDisplay.messages.length).toBe(0);
    });
});
