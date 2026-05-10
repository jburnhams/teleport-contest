import { describe, it, expect, vi } from 'vitest';
import { pline, You, verbalize } from '../js/pline.js';
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
