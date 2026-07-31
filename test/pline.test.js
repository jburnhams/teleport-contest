import { describe, it, expect, vi } from 'vitest';
import { pline, You, verbalize, vpline, putmsghistory } from '../js/pline.js';
import { game } from '../js/gstate.js';
import { GameDisplay } from '../js/game_display.js';
import * as input from '../js/input.js';

describe('pline', () => {
    it('should format strings using %s and %d', async () => {
        game.nhDisplay = null;
        await pline('Hello %s, you have %d apples', 'world', 5);
        expect(game._pending_message).toBe('Hello world, you have 5 apples');

        await You('see a %s', 'dragon');
        expect(game._pending_message).toBe('You see a dragon');

        await verbalize('I am %s!', 'Garn');
        expect(game._pending_message).toBe('"I am Garn!"');
    });

    it('should show --More-- if there is already a message', async () => {
        game.nhDisplay = new GameDisplay(null);

        let waitTriggered = false;

        // Mock nhgetch correctly using vitest spy
        const getchSpy = vi.spyOn(input, 'nhgetch').mockImplementation(async () => {
            waitTriggered = true;
            return 32; // space character code
        });

        try {
            await pline("First message");
            expect(game.nhDisplay.topMessage).toBe("First message");
            expect(game.nhDisplay.toplin).toBe(1); // TOPLINE_NEED_MORE

            await pline("Second message");
            expect(waitTriggered).toBe(true);
            expect(game.nhDisplay.topMessage).toBe("Second message");
        } finally {
            getchSpy.mockRestore();
        }
    });

    it('vpline should only display message if flags.verbose is true', async () => {
        game.nhDisplay = new GameDisplay(null);
        game.flags = { verbose: false };

        await vpline("Hidden message");
        expect(game.nhDisplay.topMessage).toBeNull(); // Was empty initially

        game.flags.verbose = true;
        await vpline("Visible message");
        expect(game.nhDisplay.topMessage).toBe("Visible message");
    });

    it('putmsghistory should append to messages without displaying', () => {
        game.nhDisplay = new GameDisplay(null);
        game.nhDisplay.messages = [];

        putmsghistory("History message 1");
        expect(game.nhDisplay.topMessage).toBeNull(); // Should not affect display
        expect(game.nhDisplay.messages.length).toBe(1);
        expect(game.nhDisplay.messages[0]).toBe("History message 1");

    });
});
