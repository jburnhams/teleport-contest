import { describe, it, expect } from 'vitest';
import { findgold } from '../js/invent.js';
import { GOLD_PIECE, ROCK } from '../js/objects.js';

describe('invent.js', () => {
    it('findgold correctly finds gold in a chain', () => {
        const item1 = { otyp: ROCK, nobj: null };
        const gold = { otyp: GOLD_PIECE, nobj: null };
        const item3 = { otyp: ROCK, nobj: null };

        item1.nobj = gold;
        gold.nobj = item3;

        expect(findgold(item1)).toBe(gold);
        expect(findgold(item3)).toBeNull();
        expect(findgold(null)).toBeNull();
    });
});
