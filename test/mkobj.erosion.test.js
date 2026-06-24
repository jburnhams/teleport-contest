import { describe, it, expect } from 'vitest';
import {
    may_generate_eroded,
    is_multigen
} from '../js/mkobj.js';
import * as C from '../js/const.js';
import { game } from '../js/gstate.js';
import { objects } from '../js/objects.js';

describe('D2.3: may_generate_eroded', () => {
    it('is false if moves <= 1 and not in_mklev', () => {
        game.moves = 1;
        game.context = { in_mklev: false };
        expect(may_generate_eroded({})).toBe(false);
    });
});

describe('D2.3: is_multigen', () => {
    it('returns true if weapon and skill is between -P_SHURIKEN and -P_BOW', () => {
        const dartOtyp = objects.findIndex(o => o && o.oc_name === 'dart');
        console.log('Dart Otyp:', dartOtyp);
        console.log('Dart Skill:', objects[dartOtyp].oc_skill);
        console.log('-C.P_SHURIKEN:', -C.P_SHURIKEN);
        console.log('-C.P_BOW:', -C.P_BOW);
        const obj = { oclass: C.WEAPON_CLASS, otyp: dartOtyp };
        expect(is_multigen(obj)).toBe(true);
    });
});
