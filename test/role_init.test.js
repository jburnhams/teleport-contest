import { describe, it, expect, beforeEach, vi } from 'vitest';
import { game, resetGame } from '../js/gstate.js';
import { initRng } from '../js/rng.js';
import { role_init_extra } from '../js/role_init.js';
import * as rng from '../js/rng.js';

describe('role_init.js', () => {
    beforeEach(() => {
        resetGame();
        initRng(123n);
    });

    it('role_init_extra makes RNG calls for specific roles', () => {
        const spy = vi.spyOn(rng, 'rn2');
        
        role_init_extra(0); // Archeologist
        expect(spy).toHaveBeenCalledWith(100);
        
        spy.mockClear();
        role_init_extra(6); // Priest
        expect(spy).toHaveBeenCalled();
        
        spy.mockClear();
        role_init_extra(1); // Barbarian (no extra calls)
        expect(spy).not.toHaveBeenCalled();
    });
});
