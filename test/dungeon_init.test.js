import { describe, it, expect, beforeEach } from 'vitest';
import { init_dungeons, init_castle_tune, u_init_misc } from '../js/dungeon_init.js';
import { initRng, enableRngLog, getRngLog } from '../js/rng.js';
import { resetGame } from '../js/gstate.js';

describe('dungeon_init.js', () => {
    beforeEach(() => {
        resetGame();
        initRng(8000);
        enableRngLog();
    });

    it('runs init_dungeons without error', () => {
        init_dungeons(false);
        const log = getRngLog();
        expect(log.length).toBeGreaterThan(0);
    });

    it('runs init_dungeons in wizard mode', () => {
        init_dungeons(true);
        const log = getRngLog();
        expect(log.length).toBeGreaterThan(0);
    });

    it('init_castle_tune consumes 5 RNG calls', () => {
        init_castle_tune();
        const log = getRngLog();
        expect(log.length).toBe(5);
        for (const entry of log) {
            expect(entry).toMatch(/^rn2\(7\)=\d+$/);
        }
    });

    it('u_init_misc consumes 1 RNG call', () => {
        u_init_misc();
        const log = getRngLog();
        expect(log.length).toBe(1);
        expect(log[0]).toMatch(/^rn2\(10\)=\d+$/);
    });
});
