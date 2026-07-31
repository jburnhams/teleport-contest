import { describe, it, expect, vi } from 'vitest';
import { pline, You, verbalize, vpline, Sprintf, putmsghistory } from '../js/pline.js';
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
});

describe('pline enhancements', () => {
    it('vpline respects game.flags.verbose', async () => {
    game.nhDisplay = { putstr_message: vi.fn(), messages: [] };

    game.flags = { verbose: false };
    await vpline("Verbose hidden");
    expect(game.nhDisplay.putstr_message).not.toHaveBeenCalled();

    game.flags = { verbose: true };
    await vpline("Verbose shown");
    expect(game.nhDisplay.putstr_message).toHaveBeenCalledWith("Verbose shown");
});

it('Sprintf formats correctly', () => {
    expect(Sprintf("Hello %s", "World")).toBe("Hello World");
    expect(Sprintf("Number %d and %%", 42)).toBe("Number 42 and %");
});

it('putmsghistory pushes to history without printing', () => {
    game.nhDisplay = { messages: [] };
    putmsghistory("History 1");
    expect(game.nhDisplay.messages).toEqual(["History 1"]);
    for (let i = 2; i <= 25; i++) {
        putmsghistory(`History ${i}`);
    }
    expect(game.nhDisplay.messages.length).toBe(20);
    expect(game.nhDisplay.messages[0]).toBe("History 6");
    expect(game.nhDisplay.messages[19]).toBe("History 25");
});

});
