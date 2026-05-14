import { describe, it, expect } from 'vitest';
import { GameDisplay } from '../js/game_display.js';
import { Terminal } from '../js/terminal.js';
import { NHW_TEXT, NHW_MENU } from '../js/const.js';

describe('GameDisplay Window System', () => {
    it('creates and destroys windows', () => {
        const terminal = new Terminal(null, { rows: 24, cols: 80 });
        const display = new GameDisplay(terminal);

        const winid = display.create_nhwindow(NHW_TEXT);
        expect(winid).toBeGreaterThanOrEqual(0);
        expect(display.windows[winid]).toBeDefined();
        expect(display.windows[winid].type).toBe(NHW_TEXT);

        display.destroy_nhwindow(winid);
        expect(display.windows[winid]).toBeNull();
    });

    it('clears window content', () => {
        const terminal = new Terminal(null, { rows: 24, cols: 80 });
        const display = new GameDisplay(terminal);
        const winid = display.create_nhwindow(NHW_TEXT);
        display.putstr_window(winid, 0, "Test string");
        expect(display.windows[winid].lines.length).toBe(1);

        display.clear_nhwindow(winid);
        expect(display.windows[winid].lines.length).toBe(0);
    });

    it('adds strings to text window and displays them', () => {
        const terminal = new Terminal(null, { rows: 24, cols: 80 });
        const display = new GameDisplay(terminal);
        const winid = display.create_nhwindow(NHW_TEXT);
        display.putstr_window(winid, 0, "Hello World");

        display.display_nhwindow(winid, false);

        // Let's check terminal output directly. row 0 col 0
        let chars = '';
        for (let i = 0; i < 11; i++) {
            chars += display.terminal.grid[0][i].ch;
        }
        expect(chars).toBe("Hello World");
    });

    it('builds and displays menus', () => {
        const terminal = new Terminal(null, { rows: 24, cols: 80 });
        const display = new GameDisplay(terminal);
        const winid = display.create_nhwindow(NHW_MENU);

        display.start_menu(winid);
        display.add_menu(winid, 0, 1, 'a', 0, 0, "Apple", false);
        display.add_menu(winid, 0, 2, 'b', 0, 0, "Banana", false);
        display.end_menu(winid, "Select a fruit:");

        const selection = display.select_menu(winid, 1);
        expect(selection).toEqual([]); // our stub returns empty for now

        let promptRow = '';
        for (let i = 0; i < 15; i++) {
            promptRow += display.terminal.grid[0][i].ch;
        }
        expect(promptRow).toBe("Select a fruit:");

        let itemRow = '';
        for (let i = 0; i < 13; i++) {
            itemRow += display.terminal.grid[1][i].ch;
        }
        expect(itemRow).toBe("a - Apple    ");
    });
});
