// C ref: pline.c
import { game } from './gstate.js';
import * as input from './input.js';
import { CLR_GRAY } from './terminal.js';

function sprintf(format, ...args) {
    let i = 0;
    return format.replace(/%%|%[sd]/g, (match) => {
        if (match === '%%') return '%';
        const val = args[i++];
        return val !== undefined ? String(val) : '';
    });
}

export function putmsghistory(msg, restoring_msghist) {
    if (!game.nhDisplay) return;

    if (restoring_msghist) {
        if (game.nhDisplay.snapshot_mesgs) {
            game.nhDisplay.snapshot_mesgs = null;
        }
    }

    if (msg) {
        if (game.nhDisplay.toplin === 1) {
            game.nhDisplay.toplin = 2;
        }

        game.nhDisplay.messages.push(msg);
        game.nhDisplay.toplines = msg;
    } else if (game.nhDisplay.snapshot_mesgs) {
        for (const m of game.nhDisplay.snapshot_mesgs) {
            game.nhDisplay.messages.push(m);
        }
        game.nhDisplay.snapshot_mesgs = null;
    }
}

export async function pline(msgOrFormat, ...args) {
    const msg = (args.length > 0 || msgOrFormat.includes('%')) ? sprintf(msgOrFormat, ...args) : msgOrFormat;

    if (!game.nhDisplay) {
        game._pending_message = msg;
        return;
    }

    const display = game.nhDisplay;
    if (display.toplin === 1) {
        await more();
    }
    display.putstr_message(msg);
}

export async function vpline(msgOrFormat, ...args) {
    if (!game.flags || !game.flags.verbose) return;
    await pline(msgOrFormat, ...args);
}

export function Sprintf(format, ...args) {
    return sprintf(format, ...args);
}

export async function more() {
    const display = game.nhDisplay;
    if (!display) return;

    let current = display.topMessage || '';
    const suffix = current.length > 0 ? " --More--" : "--More--";

    if (current.length + suffix.length > 80) {
        current = current.substring(0, 80 - suffix.length);
    }

    const moreStr = current + suffix;

    display.clearRow(0);
    display.putstr(0, 0, moreStr, CLR_GRAY);
    display.setCursor(moreStr.length, 0);

    let c = await input.nhgetch();

    display.clearRow(0);
    display.toplin = 0;
    display.topMessage = null;
}

export async function You(msgOrFormat, ...args) {
    const msg = (args.length > 0 || msgOrFormat.includes('%')) ? sprintf(msgOrFormat, ...args) : msgOrFormat;
    return await pline(`You ${msg}`);
}

export async function verbalize(msgOrFormat, ...args) {
    const msg = (args.length > 0 || msgOrFormat.includes('%')) ? sprintf(msgOrFormat, ...args) : msgOrFormat;
    return await pline(`"${msg}"`);
}
