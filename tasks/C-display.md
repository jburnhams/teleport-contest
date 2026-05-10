# Stream C — Display & Terminal Output

**Can start: NOW** | **Dependencies: None** | **Blocks: nothing**

Port the display subsystem — status lines, message handling, map rendering improvements. This work is **completely independent of the RNG path** — display code doesn't consume RNG, so it can't cause regressions. It only affects whether screens match once RNG is aligned.

**Branch:** `feature/stream-c-display`
**Files touched:** `js/botl.js` (new), `js/pline.js` (new), `js/display.js`, `js/game_display.js`, `js/cmd.js` (display-only changes)

---

## C1. botl.js — Status line rendering
- [x] Read C `src/botl.c` — understand `bot()`, `bot1()`, `bot2()` structure
- [x] Read C `src/botl.c` — understand field positioning, cursor-forward codes, conditional fields
- [x] Create `js/botl.js`
- [x] Port `bot1()` — title line: "Name the Role" + stats (St/Dx/Co/In/Wi/Ch) + alignment
- [x] Handle strength 18/xx display (e.g., "18/03", "18/**")
- [x] Port `bot2()` — status line: Dlvl, $, HP(max), Pw(max), AC, Xp/level, T:turns
- [x] Port hunger status display ("Satiated", "Hungry", "Weak", etc.)
- [x] Port encumbrance display ("Burdened", "Stressed", etc.)
- [x] Port condition flags ("Conf", "Blind", "Stun", "Hallu", etc.)
- [x] Match exact column positions — C uses `curs()` and `putstr()` with specific coordinates
- [ ] Handle the `iflags.statuslines` option (1 or 2 status lines)
- [x] Wire `bot()` into display.js `flush_screen()`, replacing inline `_statusLine1/2`
- [x] Verify: compare output against seed8000 status line from session JSON

## C2. pline.js — Message system
- [ ] Read C `src/pline.c` — understand `pline()`, `You()`, `verbalize()`, `raw_printf()`
- [ ] Read C `src/topl.c` (if present) or relevant tty code — understand `--More--` prompting
- [ ] Create `js/pline.js`
- [ ] Port `pline()` — format string handling (like printf but simpler)
- [ ] Port message line display — write to row 0 of terminal
- [ ] Port `--More--` prompt — when message would overwrite previous unread message
- [ ] Port `putmsghistory()` — message recall
- [ ] Port `Sprintf`-style format helpers used by pline
- [ ] Handle `game.flags.verbose` — some messages only show in verbose mode
- [ ] Wire into display.js, replacing simple `game._pending_message` approach

## C3. Map rendering improvements
- [ ] Read C `src/display.c` `newsym()` — full logic for what glyph to display at each cell
- [ ] Add object glyph layer to `newsym()` — show items on the ground
- [ ] Add trap glyph layer to `newsym()` — show known traps
- [ ] Add monster glyph layer to `newsym()` — show visible monsters
- [ ] Handle glyph priority: monster > player > object > trap > terrain
- [ ] Port `back_to_glyph()` — what to show when a monster/object moves away
- [ ] Port `display_self()` — player glyph (polymorphed, invisible, etc.)
- [ ] Handle dark rooms — unseen cells in unlit rooms

## C4. Terminal output format matching
- [ ] Study how C's tty code emits ANSI sequences — exact escape code format
- [ ] Compare our `render_map_row()` output against C's recorded screens byte-by-byte
- [ ] Fix any DEC line-drawing mode (SO/SI) differences
- [ ] Fix any color code differences (ANSI SGR sequences)
- [ ] Handle cursor positioning — `\x1b[row;colH` vs `\x1b[nC` cursor-forward
- [ ] Handle attribute codes — bold, inverse, underline
- [ ] Verify with the scorer's `diffCell()` / `renderCell()` comparison logic

## C5. Window system basics
- [ ] Read C `src/wintty.c` — understand `tty_putstr()`, `tty_curs()`, `tty_clear_nhwindow()`
- [ ] Port `create_nhwindow()` / `destroy_nhwindow()` — window management
- [ ] Port `display_nhwindow()` — show a completed window
- [ ] Port menu display — `start_menu()`, `add_menu()`, `end_menu()`, `select_menu()`
- [ ] This is needed for inventory display, spell lists, extended command menus, etc.
- [ ] Wire into `js/game_display.js`

## C6. Ctrl+X / insight.js improvements
- [ ] Read C `src/insight.c` — the full `doattributes()` / `enlightenment()` logic
- [ ] Refactor current `show_attributes()` out of `cmd.js` into `js/insight.js`
- [ ] Make it data-driven from actual game state (not hardcoded for Tourist)
- [ ] Port remaining attribute pages (all conditions, resistances, etc.)

---

## Verification

```bash
# Compare status line output:
node frozen/ps_test_runner.mjs sessions/seed8000-tourist-starter.session.json
# Then visually inspect the screen diff output for status line rows (22-23)

# No score regression:
npm run score:check
```

## Notes

- This stream produces zero score improvement on its own — it needs RNG to be aligned first (Stream B)
- BUT once RNG aligns, this is what converts RNG matches into screen points
- Start with C1 (status line) — it's the most impactful and best-understood
- C5 (window/menu system) is architecturally important — many commands need it
- Display code is safe to develop against the existing seed8000 session as a visual reference
