
import { describe, it, expect, beforeEach } from 'vitest';
import { initRng } from '../js/rng.js';
import * as teleport from '../js/teleport.js';
import * as C from '../js/const.js';

describe('teleport collect_coords', () => {
    beforeEach(() => {
        initRng(0n);
    });

    it('shuffles coordinates predictably based on PRNG', () => {
        let candy = new Array(C.ROWNO * C.COLNO);
        // CC_NO_FLAGS is 0, so scramble = (0 & CC_UNSHUFFLED) === 0 -> true.
        let result = teleport.collect_coords(candy, 10, 10, 1, C.CC_NO_FLAGS, null);

        expect(result).toBe(8);

        // Output coordinates to see what they are
        let coords = [];
        for (let i = 0; i < result; i++) {
            coords.push({x: candy[i].x, y: candy[i].y});
        }

        // Let's assert exactly what the PRNG outputs with seed 0
        expect(coords).toEqual([
            { x: 10, y: 9 },
            { x: 10, y: 11 },
            { x: 11, y: 11 },
            { x: 9, y: 9 },
            { x: 9, y: 11 },
            { x: 11, y: 10 },
            { x: 11, y: 9 },
            { x: 9, y: 10 }
        ]);
    });
});
