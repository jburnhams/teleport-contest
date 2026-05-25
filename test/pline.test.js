import { describe, it, expect, beforeEach } from 'vitest';
import { game } from '../js/gstate.js';
import { pline, putmsghistory, vpline } from '../js/pline.js';
import { GameDisplay } from '../js/game_display.js';

describe('pline.js', () => {
    beforeEach(() => {
        game.nhDisplay = new GameDisplay();
        game.flags = { verbose: true };
    });

    it('putmsghistory pushes messages to the display buffer and caps at 20', async () => {
        for (let i = 0; i < 25; i++) {
            await putmsghistory(`Message ${i}`, false);
        }

        expect(game.nhDisplay.messages.length).toBe(20);
        expect(game.nhDisplay.messages[0]).toBe('Message 5');
        expect(game.nhDisplay.messages[19]).toBe('Message 24');
    });

    it('vpline checks flags.verbose before plining', async () => {
        game.flags.verbose = false;
        await vpline("Silent message");
        expect(game.nhDisplay.topMessage).toBeNull();

        game.flags.verbose = true;
        await vpline("Verbose message");
        expect(game.nhDisplay.topMessage).toBe("Verbose message");
    });
});
