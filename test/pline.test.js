import { describe, it, expect, vi } from 'vitest';
import { pline, You, verbalize, putmsghistory, vpline, Sprintf } from '../js/pline.js';
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

        const formatted = Sprintf('Hello %s', 'World');
        expect(formatted).toBe('Hello World');
    });

    it('should show --More-- if there is already a message', async () => {
        game.nhDisplay = new GameDisplay(null);

        let waitTriggered = false;

        const getchSpy = vi.spyOn(input, 'nhgetch').mockImplementation(async () => {
            waitTriggered = true;
            return 32;
        });

        try {
            await pline("First message");
            expect(game.nhDisplay.topMessage).toBe("First message");
            expect(game.nhDisplay.toplin).toBe(1);

            await pline("Second message");
            expect(waitTriggered).toBe(true);
            expect(game.nhDisplay.topMessage).toBe("Second message");
        } finally {
            getchSpy.mockRestore();
        }
    });

    it('vpline should only print when verbose is true', async () => {
        game.nhDisplay = null;
        game.flags = { verbose: false };
        game._pending_message = "";

        await vpline('Verbose message');
        expect(game._pending_message).toBe('');

        game.flags.verbose = true;
        await vpline('Verbose message 2');
        expect(game._pending_message).toBe('Verbose message 2');
    });

    it('putmsghistory should correctly manipulate messages array', () => {
        game.nhDisplay = new GameDisplay(null);
        game.nhDisplay.messages = [];

        putmsghistory("test message", false);
        expect(game.nhDisplay.messages.length).toBe(1);
        expect(game.nhDisplay.messages[0]).toBe("test message");

        game.nhDisplay.snapshot_mesgs = ["snap1", "snap2"];
        putmsghistory(null, false);
        expect(game.nhDisplay.messages.length).toBe(3);
        expect(game.nhDisplay.messages[1]).toBe("snap1");
    });
});
