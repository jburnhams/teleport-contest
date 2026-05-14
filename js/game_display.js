// game_display.js — NetHack-specific display wrapper around Terminal.
// Edit freely; the contest only freezes isaac64.js and terminal.js.
//
// Adds game state properties (topMessage, toplines, toplin) and
// message window handling. Delegates all terminal operations to
// the wrapped Terminal instance.
//
// Usage:
//   const terminal = new Terminal('game-container');
//   const display = new GameDisplay(terminal);
//   // display.setCell, display.readKey etc. all delegate to terminal
//   // display.topMessage, display.putstr_message are NetHack-specific

import { Terminal, CLR_GRAY } from './terminal.js';
import { NHW_TEXT } from './const.js';

const TOPLINE_EMPTY = 0;
const TOPLINE_NEED_MORE = 1;

export class GameDisplay {
    constructor(terminalOrContainerId) {
        // Accept either a Terminal instance or a container ID (backward compat)
        if (terminalOrContainerId instanceof Terminal) {
            this.terminal = terminalOrContainerId;
        } else {
            this.terminal = new Terminal(
                terminalOrContainerId != null ? terminalOrContainerId : null,
                { rows: 24, cols: 80 }
            );
        }

        // NetHack-specific message state
        this.topMessage = null;
        this.toplines = '';
        this.messages = [];
        this.toplin = TOPLINE_EMPTY;
        this.messageWinFlags = 0;
    }

    // --- Delegate all Terminal properties and methods ---

    get rows() { return this.terminal.rows; }
    get cols() { return this.terminal.cols; }
    get grid() { return this.terminal.grid; }
    get cursorCol() { return this.terminal.cursorCol; }
    set cursorCol(v) { this.terminal.cursorCol = v; }
    get cursorRow() { return this.terminal.cursorRow; }
    set cursorRow(v) { this.terminal.cursorRow = v; }
    get cursorVisible() { return this.terminal.cursorVisible; }
    set cursorVisible(v) { this.terminal.cursorVisible = v; }
    get spans() { return this.terminal.spans; }
    get container() { return this.terminal.container; }
    get flags() { return this.terminal.flags; }
    set flags(v) { this.terminal.flags = v; }

    // Display methods
    setCell(col, row, ch, color, attr) { return this.terminal.setCell(col, row, ch, color, attr); }
    putstr(col, row, str, color, attr) { return this.terminal.putstr(col, row, str, color, attr); }
    setCursor(col, row) { return this.terminal.setCursor(col, row); }
    clearScreen() { return this.terminal.clearScreen(); }
    clearRow(row) { return this.terminal.clearRow(row); }
    scrollUp() { return this.terminal.scrollUp(); }
    moveCursor(x, y) { return this.terminal.moveCursor(x, y); }
    putChar(x, y, ch, attr) { return this.terminal.putChar(x, y, ch, attr); }
    getChar(x, y) { return this.terminal.getChar(x, y); }
    putString(str) { return this.terminal.putString(str); }
    putCharAtCursor(ch) { return this.terminal.putCharAtCursor(ch); }
    clearToEol() { return this.terminal.clearToEol(); }
    cursSet(visibility) { return this.terminal.cursSet(visibility); }
    flush() { return this.terminal.flush?.(); }
    getPreElement() { return this.terminal.getPreElement(); }
    getCanvas() { return this.terminal.getCanvas?.(); }
    colorToCss(color) { return this.terminal.colorToCss(color); }
    captureForShell() { return this.terminal.captureForShell(); }

    // Input methods — delegate to terminal with NetHack-specific defaults
    pushKey(code) { return this.terminal.pushKey(code); }
    clearInputQueue() { return this.terminal.clearInputQueue(); }
    get isWaitingForInput() { return this.terminal.isWaitingForInput; }
    get inputQueueLength() { return this.terminal.inputQueueLength; }
    get waitEpoch() { return this.terminal.waitEpoch; }

    /**
     * Read a key with NetHack-specific options bundled.
     * Apps set keyMapper, onInterrupt, onEmptyQueue on GameDisplay;
     * these are passed through to terminal.readKey on every call.
     */
    readKey(extraOptions) {
        return this.terminal.readKey({
            keyMapper: this.keyMapper,
            onInterrupt: this.onInterrupt,
            onEmptyQueue: this.onEmptyQueue,
            ...extraOptions,
        });
    }

    /** NetHack key mapper — converts browser keys to game codes. */
    keyMapper = null;
    /** Ctrl-C handler. */
    onInterrupt = null;
    /** Called when input queue is empty (headless replay). */
    onEmptyQueue = null;

    // --- NetHack-specific methods ---

    putstr_message(msg) {
        this.clearRow(0);
        this.putstr(0, 0, msg, CLR_GRAY);
        this.topMessage = msg.trimEnd();
        this.toplines = this.topMessage;
        this.toplin = this.topMessage ? TOPLINE_NEED_MORE : TOPLINE_EMPTY;
        this.messages.push(this.topMessage);
        if (this.messages.length > 20) this.messages.shift();
    }

    renderStatus(_player) {
        // TODO: full status line rendering from player stats
    }

    moveCursorTo(col, row = 0) {
        this.setCursor(col, row);
    }

    // --- Window system basics ---

    create_nhwindow(type) {
        if (!this.windows) this.windows = [];
        const win = { type: type, lines: [], items: [], active: false, maxrow: 0 };
        this.windows.push(win);
        return this.windows.length - 1; // Return window id
    }

    destroy_nhwindow(winid) {
        if (!this.windows || !this.windows[winid]) return;
        this.windows[winid] = null; // Free slot
    }

    clear_nhwindow(winid) {
        if (!this.windows || !this.windows[winid]) return;
        const win = this.windows[winid];
        win.lines = [];
        win.items = [];
    }

    display_nhwindow(winid, blocking) {
        if (!this.windows || !this.windows[winid]) return;
        const win = this.windows[winid];
        win.active = true;

        if (win.type === NHW_TEXT) {
            this.clearScreen();
            for (let i = 0; i < win.lines.length; i++) {
                if (i >= this.terminal.rows - 1) break;


                this.terminal.putstr(0, i, win.lines[i].str, 0, win.lines[i].attr);
            }
            if (blocking) {

                this.setCursor(0, Math.min(win.lines.length, this.terminal.rows - 1));
            }
        }
    }

    putstr_window(winid, attr, str) {
        if (!this.windows || !this.windows[winid]) return;
        const win = this.windows[winid];
        win.lines.push({ attr, str });
    }

    start_menu(winid) {
        if (!this.windows || !this.windows[winid]) return;
        const win = this.windows[winid];
        win.items = [];
    }

    add_menu(winid, glyph, identifier, accelerator, group_accel, attr, str, preselected) {
        if (!this.windows || !this.windows[winid]) return;
        const win = this.windows[winid];
        win.items.push({ glyph, identifier, accelerator, group_accel, attr, str, preselected });
    }

    end_menu(winid, prompt) {
        if (!this.windows || !this.windows[winid]) return;
        const win = this.windows[winid];
        win.prompt = prompt;
    }

    select_menu(winid, how) {
        if (!this.windows || !this.windows[winid]) return [];
        const win = this.windows[winid];
        // Render menu
        this.clearScreen();
        let row = 0;
        if (win.prompt) {
            this.terminal.putstr(0, row++, win.prompt, 0, 0);
        }
        for (let i = 0; i < win.items.length; i++) {
            if (row >= this.terminal.rows - 1) break;
            const item = win.items[i];
            const acc = item.accelerator ? item.accelerator + ' - ' : '    ';
            this.terminal.putstr(0, row++, acc + item.str, 0, item.attr);
        }


        return [];
    }

}
