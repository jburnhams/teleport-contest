// C ref: pline.c
import { game } from './gstate.js';
import * as input from './input.js';
import { CLR_GRAY } from './terminal.js';

function sprintf(format, ...args) {
    let i = 0;
    return format.replace(/%[sd]/g, () => {
        const val = args[i++];
        return val !== undefined ? String(val) : '';
    });
}

export async function pline(msgOrFormat, ...args) {
    const msg = args.length > 0 ? sprintf(msgOrFormat, ...args) : msgOrFormat;

    if (!game.nhDisplay) {
        game._pending_message = msg;
        return;
    }

    const display = game.nhDisplay;
    if (display.toplin === 1) { // TOPLINE_NEED_MORE
        await more();
    }
    display.putstr_message(msg);
}

export async function more() {
    const display = game.nhDisplay;
    if (!display) return;

    // Add --More-- to current message
    const current = display.topMessage || '';
    const moreStr = current + (current.length > 0 ? " " : "") + "--More--";

    display.clearRow(0);
    display.putstr(0, 0, moreStr, CLR_GRAY);
    display.setCursor(moreStr.length, 0);

    // Wait for input
    let c = await input.nhgetch();
    while (c !== 27 && c !== 32 && c !== 10 && c !== 13) {
        c = await input.nhgetch();
    }

    display.clearRow(0);
    display.toplin = 0; // TOPLINE_EMPTY
    display.topMessage = null;
}

export function You(msgOrFormat, ...args) {
    const msg = args.length > 0 ? sprintf(msgOrFormat, ...args) : msgOrFormat;
    return pline(`You ${msg}`);
}

export function verbalize(msgOrFormat, ...args) {
    const msg = args.length > 0 ? sprintf(msgOrFormat, ...args) : msgOrFormat;
    return pline(`"${msg}"`);
}
