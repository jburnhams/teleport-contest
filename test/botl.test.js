import { describe, it, expect } from 'vitest';
import { bot1, bot2 } from '../js/botl.js';
import { A_STR, A_INT, A_WIS, A_DEX, A_CON, A_CHA, A_NEUTRAL } from '../js/const.js';
import { game } from '../js/gstate.js';

game.plname = 'Contestant';
game.u = {
    acurr: { a: [] },
    ualign: { type: A_NEUTRAL }
};
game.urole = { name: { m: 'Tourist' }, rank: { m: 'Rambler' } };
game.flags = {};

// Fill stats
game.u.acurr.a[0] = 9;
game.u.acurr.a[3] = 11;
game.u.acurr.a[4] = 16;
game.u.acurr.a[1] = 14;
game.u.acurr.a[2] = 12;
game.u.acurr.a[5] = 16;

describe('botl', () => {
    it('should format bot1 correctly for base tourist', () => {
        const line1 = bot1();
        expect(line1).toBe('Contestant the Rambler\x1b[9CSt:9 Dx:14 Co:12 In:11 Wi:16 Ch:16 Neutral');
    });

    it('should handle strength > 18', () => {
        game.u.acurr.a[0] = 19; // 18/01
        expect(bot1()).toContain('St:18/01');

        game.u.acurr.a[0] = 118; // 18/**
        expect(bot1()).toContain('St:18/**');

        game.u.acurr.a[0] = 119; // 19
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

        // With flags.time and flags.showexp
        game.flags.time = true;
        game.flags.showexp = true;
        expect(bot2()).toBe('Dlvl:1 $:757 HP:10(10) Pw:2(2) AC:10 Xp:1/0 T:2');

        // Without flags.time
        game.flags.time = false;
        game.flags.showexp = true;
        expect(bot2()).toBe('Dlvl:1 $:757 HP:10(10) Pw:2(2) AC:10 Xp:1/0');

        // Without flags.showexp
        game.flags.time = true;
        game.flags.showexp = false;
        expect(bot2()).toBe('Dlvl:1 $:757 HP:10(10) Pw:2(2) AC:10 Xp:1 T:2');
    });

    it('should show status conditions', () => {
        game.u.ustoned = true;
        game.u.ublind = true;
        game.u.uhs = 2; // Hungry
        game.u.ucap = 1; // Burdened
        expect(bot2()).toContain('Stone');
        expect(bot2()).toContain('Blind');
        expect(bot2()).toContain('Hungry');
        expect(bot2()).toContain('Burdened');
    });

    it('should show sickness conditions', () => {
        game.u = { ...game.u, ustoned: false, ublind: false, uhs: 1, ucap: 0 };
        game.u.usick_type = 1; // FoodPois
        expect(bot2()).toContain('FoodPois');
        game.u.usick_type = 2; // TermIll
        expect(bot2()).toContain('TermIll');
    });

    it('should show movement conditions', () => {
        game.u = { ...game.u, usick_type: 0 };
        game.u.ulev = true;
        game.u.ufly = true;
        game.u.usteed = true;
        expect(bot2()).toContain('Lev');
        expect(bot2()).toContain('Fly');
        expect(bot2()).toContain('Ride');
    });
});
