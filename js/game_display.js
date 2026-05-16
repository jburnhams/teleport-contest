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

import { Terminal, CLR_GRAY, CLR_WHITE, NO_COLOR } from './terminal.js';
import {
    WIN_ERR, NHW_MESSAGE, NHW_STATUS, NHW_MAP, NHW_MENU, NHW_TEXT,
    NHW_BASE, WIN_CANCELLED
} from './const.js';

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

        this.wins = new Array(20).fill(null);
        this.WIN_MESSAGE = WIN_ERR;
        this.WIN_STATUS = WIN_ERR;
        this.WIN_MAP = WIN_ERR;
        this.WIN_INVEN = WIN_ERR;
        this.BASE_WINDOW = this.create_nhwindow(NHW_BASE);
    }


    create_nhwindow(type) {
        let newid;
        for (newid = 0; newid < 20; ++newid) {
            if (!this.wins[newid]) break;
        }
        if (newid === 20) {
            throw new Error("No window slots!");
        }

        const newwin = {
            type: type,
            flags: 0,
            active: false,
            curx: 0,
            cury: 0,
            mlist: null,
            nitems: 0,
            how: 0,
            mbehavior: 0
        };

        this.wins[newid] = newwin;
        return newid;
    }

    destroy_nhwindow(window) {
        if (window === WIN_ERR || !this.wins[window]) return;
        this.wins[window] = null;
    }

    clear_nhwindow(window) {
        if (window === WIN_ERR || !this.wins[window]) return;
        const cw = this.wins[window];
        switch (cw.type) {
            case NHW_MESSAGE:
                if (this.toplin !== TOPLINE_EMPTY) {
                    this.clearRow(0);
                    this.toplin = TOPLINE_EMPTY;
                    this.topMessage = null;
                }
                break;
            case NHW_STATUS:
                break;
            case NHW_MAP:
            case NHW_BASE:
                this.clearScreen();
                break;
            case NHW_MENU:
            case NHW_TEXT:
                break;
        }
    }

    display_nhwindow(window, blocking) {
        if (window === WIN_ERR || !this.wins[window]) return;
        const cw = this.wins[window];
        if (cw.flags & WIN_CANCELLED) return;

        switch (cw.type) {
            case NHW_MESSAGE:
                if (this.toplin === TOPLINE_NEED_MORE) {
                    this.toplin = TOPLINE_EMPTY;
                }
                break;
            case NHW_MAP:
            case NHW_BASE:
                break;
            case NHW_TEXT:
            case NHW_MENU:
                break;
        }
    }

    start_menu(window, mbehavior) {
        if (window === WIN_ERR || !this.wins[window]) return;
        const cw = this.wins[window];

        cw.mbehavior = mbehavior;
        cw.mlist = null;
        cw.nitems = 0;

        this.clear_nhwindow(window);
    }

    add_menu(window, glyphinfo, identifier, ch, gch, attr, clr, str, itemflags) {
        if (!str || window === WIN_ERR || !this.wins[window]) return;
        const cw = this.wins[window];
        if (cw.type !== NHW_MENU) return;

        const preselected = (itemflags & 1) !== 0;

        cw.nitems++;
        const item = {
            identifier,
            ch,
            gch,
            attr,
            color: clr,
            str,
            selected: preselected,
            count: -1,
            next: cw.mlist
        };

        cw.mlist = item;
    }

    end_menu(window, prompt) {
        if (window === WIN_ERR || !this.wins[window]) return;
        const cw = this.wins[window];
        if (cw.type !== NHW_MENU) return;

        // Reverse the list
        let prev = null;
        let current = cw.mlist;
        let next = null;
        while (current !== null) {
            next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        cw.mlist = prev;

        if (prompt) {
            const emptyItem = {
                identifier: null,
                ch: 0, gch: 0, attr: 0, color: 0,
                str: "",
                selected: false, count: -1,
                next: cw.mlist
            };
            const promptItem = {
                identifier: null,
                ch: 0, gch: 0, attr: 0, color: 0,
                str: prompt,
                selected: false, count: -1,
                next: emptyItem
            };
            cw.mlist = promptItem;
        }
    }

    async select_menu(window, how) {
        if (window === WIN_ERR || !this.wins[window]) return [];
        const cw = this.wins[window];
        if (cw.type !== NHW_MENU) return [];

        cw.how = how; // 0 = PICK_NONE, 1 = PICK_ONE, 2 = PICK_ANY

        // Generate selectors for items without them
        let pcount = 0;
        let curr = cw.mlist;
        let totalItems = 0;
        while (curr) {
            if (curr.identifier && !curr.ch) {
                // In C, menu selection uses 52 letters: a-z, A-Z.
                let charCode = (pcount < 26) ? (97 + pcount) : (65 + pcount - 26);
                curr.ch = String.fromCharCode(charCode);
                pcount++;
            }
            totalItems++;
            curr = curr.next;
        }

        const max_rows = this.terminal.rows - 1; // Leave 1 line for prompt
        const npages = Math.ceil(totalItems / max_rows);
        let curr_page = 0;

        let menu_list = [];
        let finished = false;
        let countStr = "";
        let counting = false;

        while (!finished) {
            this.clearScreen();

            // Get items for current page
            let page_start = cw.mlist;
            for (let skip = 0; skip < curr_page * max_rows; skip++) {
                if (page_start) page_start = page_start.next;
            }

            let row = 0;
            let p_curr = page_start;
            let valid_selectors = [];

            while (p_curr && row < max_rows) {
                let prefix = "";
                if (p_curr.identifier) {
                    prefix = `${p_curr.ch} - `;
                    if (p_curr.selected) {
                        prefix = prefix.replace("-", (p_curr.count !== -1) ? "#" : "+");
                    }
                    valid_selectors.push(p_curr.ch);
                } else {
                    prefix = "    ";
                }
                if (!p_curr.identifier && p_curr.str === "") prefix = "";

                this.putstr(0, row, prefix + p_curr.str, p_curr.color || NO_COLOR, p_curr.attr || 0);
                row++;
                p_curr = p_curr.next;
            }

            let promptStr = "";
            if (npages > 1) {
                promptStr = `(${curr_page + 1} of ${npages})`;
            } else {
                promptStr = "(end)";
            }

            this.putstr(0, row, promptStr, CLR_GRAY, 0);

            // Read key
            this.setCursor(promptStr.length + 1, row);
            const key = await this.readKey({ onInterrupt: () => null });
            if (key === null || key === 27) { // ESC cancels
                cw.flags |= WIN_CANCELLED;

                let c = cw.mlist;
                while (c) {
                    c.selected = false;
                    c.count = -1;
                    c = c.next;
                }
                finished = true;
                break;
            }

            const ch = String.fromCharCode(key);

            if (ch === ' ' || ch === '\r' || ch === '\n') {
                if (ch === ' ' && npages > 1 && curr_page < npages - 1) {
                    curr_page++;
                } else {
                    finished = true;
                }
                countStr = ""; counting = false;
                continue;
            }

            if (ch === '>' && npages > 1 && curr_page < npages - 1) {
                curr_page++; countStr = ""; counting = false; continue;
            }
            if (ch === '<' && npages > 1 && curr_page > 0) {
                curr_page--; countStr = ""; counting = false; continue;
            }
            if (ch === '^' && npages > 1) {
                curr_page = 0; countStr = ""; counting = false; continue;
            }
            if (ch === '|' && npages > 1) {
                curr_page = npages - 1; countStr = ""; counting = false; continue;
            }

            if (how === 0) { // PICK_NONE
                finished = true;
                continue;
            }

            if (ch >= '0' && ch <= '9') {
                counting = true;
                countStr += ch;
                continue;
            }

            // Toggle selection
            let target = cw.mlist;
            while(target) {
                if (target.identifier && target.ch === ch) {
                    break;
                }
                target = target.next;
            }

            if (target) {
                const count = counting && countStr.length > 0 ? parseInt(countStr, 10) : -1;
                if (how === 1) { // PICK_ONE
                    let c = cw.mlist;
                    while (c) {
                        c.selected = false;
                        c.count = -1;
                        c = c.next;
                    }
                    target.selected = true;
                    target.count = count;
                    finished = true;
                } else { // PICK_ANY
                    target.selected = !target.selected;
                    target.count = target.selected ? count : -1;
                }
            }

            countStr = "";
            counting = false;
        }

        let c = cw.mlist;
        while (c) {
            if (c.identifier && c.selected) {
                menu_list.push({ item: c.identifier, count: c.count });
            }
            c = c.next;
        }

        return menu_list;
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
}
