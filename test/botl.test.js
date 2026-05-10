import { describe, it, expect, vi } from 'vitest';
import { bot1, bot2 } from '../js/botl.js';
import { A_STR, A_INT, A_WIS, A_DEX, A_CON, A_CHA, A_NEUTRAL, A_LAWFUL, A_CHAOTIC } from '../js/const.js';
import { game } from '../js/gstate.js';

game.plname = 'Contestant';
game.u = {
    acurr: { a: [] },
    ualign: { type: A_NEUTRAL }
};
game.urole = { name: { m: 'Tourist' }, rank: { m: 'Rambler' } };

// Fill stats
game.u.acurr.a[A_STR] = 9;
game.u.acurr.a[A_INT] = 11;
game.u.acurr.a[A_WIS] = 16;
game.u.acurr.a[A_DEX] = 14;
game.u.acurr.a[A_CON] = 12;
game.u.acurr.a[A_CHA] = 16;

describe('botl', () => {
    it('should format bot1 correctly for base tourist', () => {
        const line1 = bot1();
        expect(line1).toBe('Contestant the Rambler\x1b[9CSt:9 Dx:14 Co:12 In:11 Wi:16 Ch:16 Neutral');
    });

    it('should handle strength > 18', () => {
        game.u.acurr.a[A_STR] = 19; // 18/01
        expect(bot1()).toContain('St:18/01');

        game.u.acurr.a[A_STR] = 118; // 18/**
        expect(bot1()).toContain('St:18/**');

        game.u.acurr.a[A_STR] = 119; // 19
        expect(bot1()).toContain('St:19');
    });
});

describe('bot2', () => {
    it('should format bot2 correctly for base tourist', () => {
        game._goldCount = 757;
        game.u.uhp = 10;
        game.u.uhpmax = 10;
        game.u.uen = 2;
        game.u.uenmax = 2;
        game.u.uac = 10;
        game.u.ulevel = 1;
        game.u.uexp = 0;
        game.moves = 2;
        game.u.uhs = 1;
        game.u.ucap = 0;
        game.u.uz = { dnum: 0, dlevel: 1 };

        const line2 = bot2();
        expect(line2).toBe('Dlvl:1 $:757 HP:10(10) Pw:2(2) AC:10 Xp:1/0 T:2');
    });
});
