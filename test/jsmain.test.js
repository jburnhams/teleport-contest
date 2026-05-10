import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NethackGame, runSegment } from '../js/jsmain.js';
import { game, resetGame } from '../js/gstate.js';
import { init_vision_globals } from '../js/vision.js';

describe('jsmain.js', () => {
    beforeEach(() => {
        resetGame();
        init_vision_globals();
    });

    it('NethackGame initializes with options', () => {
        const nhGame = new NethackGame({ seed: 1234, nethackrc: 'OPTIONS=name:Tester' });
        expect(nhGame._seed).toBe(1234);
        expect(nhGame._nethackrc).toBe('OPTIONS=name:Tester');
    });

    it('runSegment executes a game segment', async () => {
        const input = {
            seed: 8000,
            nethackrc: 'OPTIONS=name:Tester',
            moves: 'Tester\ryy\x11' // Name, Shall I pick?, Is this ok?, Ctrl-Q to quit
        };
        
        // Mocking moveloop_core to avoid infinite loop if input is empty
        // Actually runSegment has a maxIter limit.
        
        const result = await runSegment(input);
        expect(result).toBeInstanceOf(NethackGame);
        expect(result.getScreens().length).toBeGreaterThan(0);
        expect(result.getRngLog().length).toBeGreaterThan(0);
    });
});
