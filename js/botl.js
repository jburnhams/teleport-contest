import { game } from './gstate.js';
import { BOTL_NSIZ, A_CHAOTIC, A_NEUTRAL, A_LAWFUL, COLNO, A_STR, A_DEX, A_CON, A_INT, A_WIS, A_CHA } from './const.js';

function get_strength_str() {
    const st = game.u?.acurr?.a?.[A_STR] || 0;
    if (st > 18) {
        if (st > 118) {
            return (st - 100).toString().padStart(2, ' ');
        } else if (st < 118) {
            return `18/${(st - 18).toString().padStart(2, '0')}`;
        } else {
            return '18/**';
        }
    } else {
        return st.toString().padEnd(1, ' ');
    }
}

export function bot1() {
    if (!game.u) return '';

    let newbot1 = '';
    const plname = game.plname || 'Hero';
    let nameStr = plname;
    if (nameStr.length > 0 && nameStr[0] >= 'a' && nameStr[0] <= 'z') {
        nameStr = nameStr[0].toUpperCase() + nameStr.slice(1);
    }
    nameStr = nameStr.slice(0, BOTL_NSIZ);
    newbot1 += nameStr + " the ";

    let rankStr = game.urole?.rank?.m || game.urole?.name?.m || 'Adventurer';
    newbot1 += rankStr;

    const title = `${nameStr} the ${rankStr}`;
    const gap = Math.max(1, 31 - title.length);
    let output = '';

    const statsStr = `St:${get_strength_str()} Dx:${game.u.acurr?.a?.[A_DEX]||0} Co:${game.u.acurr?.a?.[A_CON]||0} In:${game.u.acurr?.a?.[A_INT]||0} Wi:${game.u.acurr?.a?.[A_WIS]||0} Ch:${game.u.acurr?.a?.[A_CHA]||0}`;

    const alignType = game.u.ualign?.type ?? 0;
    const alignStr = alignType === A_CHAOTIC ? " Chaotic" : alignType === A_NEUTRAL ? " Neutral" : " Lawful";

    if (gap > 4) {
        output = `${title}\x1b[${gap}C${statsStr}${alignStr}`;
    } else {
        output = `${title}${' '.repeat(gap)}${statsStr}${alignStr}`;
    }

    return output;
}

export const hu_stat = [
    "Satiated", "       ", "Hungry", "Weak", "Fainting", "Fainted", "Starved"
];

export const enc_stat = [
    "",         "Burdened",  "Stressed",
    "Strained", "Overtaxed", "Overloaded"
];

export function bot2() {
    if (!game.u) return '';

    const dlvl = game.u.uz?.dlevel ?? 1;
    let money = game._goldCount || 0;
    if (money < 0) money = 0;

    let hp = game.u.uhp || 0;
    let hpmax = game.u.uhpmax || 0;
    if (hp < 0) hp = 0;
    let uen = game.u.uen ?? 0;
    let uenmax = game.u.uenmax ?? 0;
    let uac = game.u.uac ?? 10;

    let ulevel = game.u.ulevel || 1;
    let uexp = game.u.uexp || 0;
    let moves = game.moves || 1;

    let cond = '';
    const uhs = game.u.uhs ?? 1;
    if (uhs !== 1 && hu_stat[uhs]) {
        cond += ` ${hu_stat[uhs]}`;
    }
    const cap = game.u.ucap ?? 0;
    if (cap > 0 && enc_stat[cap]) {
        cond += ` ${enc_stat[cap]}`;
    }

    let acStr = uac.toString().padEnd(2, ' ');
    let newbot2 = `Dlvl:${dlvl} $:${Math.min(money, 999999)} HP:${Math.min(hp, 9999)}(${Math.min(hpmax, 9999)}) Pw:${Math.min(uen, 9999)}(${Math.min(uenmax, 9999)}) AC:${acStr} Xp:${ulevel}/${uexp} T:${moves}${cond}`;

    return newbot2;
}
