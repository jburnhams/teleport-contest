// C ref: wintty.c
import { describe, it, expect, vi } from 'vitest';
import { GameDisplay } from '../js/game_display.js';
import { Terminal } from '../js/terminal.js';
import { NHW_MENU, WIN_ERR } from '../js/const.js';

describe('GameDisplay - Menu System', () => {
    it('creates and destroys menus correctly', () => {
        const terminal = new Terminal(null, { rows: 24, cols: 80 });
        const display = new GameDisplay(terminal);

        const winId = display.create_nhwindow(NHW_MENU);
        expect(winId).toBeGreaterThan(-1);
        expect(display.wins[winId].type).toBe(NHW_MENU);

        display.destroy_nhwindow(winId);
        expect(display.wins[winId]).toBeNull();
    });

    it('adds menu items correctly', () => {
        const terminal = new Terminal(null, { rows: 24, cols: 80 });
        const display = new GameDisplay(terminal);
        const winId = display.create_nhwindow(NHW_MENU);

        display.start_menu(winId, 0);
        display.add_menu(winId, null, {id: 1}, 'a', 0, 0, 0, "Item 1", 0);
        display.add_menu(winId, null, {id: 2}, 'b', 0, 0, 0, "Item 2", 1); // selected

        let count = 0; let curr = display.wins[winId].mlist; while(curr) { count++; curr = curr.next; } expect(count).toBe(2);
        expect(display.wins[winId].mlist.str).toBe("Item 2");
        expect(display.wins[winId].mlist.selected).toBe(true);
        expect(display.wins[winId].mlist.next.str).toBe("Item 1");
        expect(display.wins[winId].mlist.next.selected).toBe(false);
    });

    it('handles end_menu and prompt correctly', () => {
        const terminal = new Terminal(null, { rows: 24, cols: 80 });
        const display = new GameDisplay(terminal);
        const winId = display.create_nhwindow(NHW_MENU);

        display.start_menu(winId, 0);
        display.add_menu(winId, null, {id: 1}, 'a', 0, 0, 0, "Item 1", 0);
        display.end_menu(winId, "Select an item:");

        let count2 = 0; let curr2 = display.wins[winId].mlist; while(curr2) { count2++; curr2 = curr2.next; } expect(count2).toBe(3);
        expect(display.wins[winId].mlist.str).toBe("Select an item:");
        expect(display.wins[winId].mlist.next.str).toBe("");
        expect(display.wins[winId].mlist.next.next.str).toBe("Item 1");
    });

    it('select_menu returns empty on PICK_NONE', async () => {
        const terminal = new Terminal(null, { rows: 24, cols: 80 });
        const display = new GameDisplay(terminal);
        const winId = display.create_nhwindow(NHW_MENU);

        display.start_menu(winId, 0);
        display.add_menu(winId, null, {id: 1}, 'a', 0, 0, 0, "Item 1", 0);
        display.end_menu(winId, "Select an item:");

        // Mock readKey to immediately return ESC
        display.readKey = vi.fn().mockResolvedValue(27);

        const result = await display.select_menu(winId, 0); // PICK_NONE
        expect(result).toEqual([]);
    });

    it('select_menu returns selected items on confirmation', async () => {
        const terminal = new Terminal(null, { rows: 24, cols: 80 });
        const display = new GameDisplay(terminal);
        const winId = display.create_nhwindow(NHW_MENU);

        display.start_menu(winId, 0);
        display.add_menu(winId, null, {id: 1}, 'a', 0, 0, 0, "Item 1", 0);
        display.add_menu(winId, null, {id: 2}, 'b', 0, 0, 0, "Item 2", 1); // preselected
        display.end_menu(winId, "Select an item:");

        // Mock readKey to immediately return ENTER
        display.readKey = vi.fn().mockResolvedValue('\n'.charCodeAt(0));

        const result = await display.select_menu(winId, 2); // PICK_ANY
        expect(result.length).toBe(1);
        expect(result[0].item.id).toBe(2);
    });
});
