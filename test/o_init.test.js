import { describe, it, expect, beforeEach } from 'vitest';
import { init_objects } from '../js/o_init.js';
import { initRng, enableRngLog, getRngLog } from '../js/rng.js';
import { resetGame } from '../js/gstate.js';

describe('o_init.js', () => {
    beforeEach(() => {
        resetGame();
        initRng(8000);
        enableRngLog();
    });

    it('performs exactly 199 RNG calls for object shuffling', () => {
        init_objects();
        const log = getRngLog();
        // 3 (gems) + 11+10..+1 (amulet: 11) + 25+24..+1 (potion: 25) + ...
        // Wait, the shuffleClass(n) logic in o_init.js is:
        // for (let i = n; i >= 1; i--) rn2(i);
        // So for n=11, it's 11 calls.
        
        // Summing them up:
        // gems: 3
        // amulet: 11
        // potion: 25
        // ring: 28
        // scroll: 41
        // spbook: 41
        // wand: 28
        // venom: 2
        // helmet: 4
        // gloves: 4
        // cloak: 4
        // boots: 7
        // wand nothing: 1
        // Total: 3 + 11 + 25 + 28 + 41 + 41 + 28 + 2 + 4 + 4 + 4 + 7 + 1 = 199
        
        expect(log.length).toBe(199);
    });
});
