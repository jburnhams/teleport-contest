import { describe, it, expect } from 'vitest';
import { undead_to_corpse } from '../js/mkobj.js';
import * as C from '../js/const.js';

describe('D2.4: undead_to_corpse', () => {
    it('converts zombie to base monster', () => {
        expect(undead_to_corpse(C.PM_KOBOLD_ZOMBIE)).toBe(C.PM_KOBOLD);
    });
});
