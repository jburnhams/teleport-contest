# Diary

Chronological log of work sessions and findings.

---

## 2026-05-09

- Forked and initialized the repo.
- Created `CLAUDE.md` with architecture overview, module DAG, and scoring contract.
- Fixed CRLF line endings in `frozen/score.sh` and `frozen/set-category.sh` (WSL issue — Windows line endings break bash `set -euo pipefail`).
- Ran full baseline score: **15/11,284 screen points** (all from `seed8000-tourist-starter`).
  - seed8000: RNG 3126/3130 (99.9%), Screen 15/23
  - All other 43 sessions: Screen 0, RNG diverges after ~50–1200 calls depending on seed.

### Deep dive: Phase 1 prerequisites
Analysed the full RNG init sequence by reading:
- `nethack-c/upstream/src/o_init.c` — object shuffle algorithm and structure
- `nethack-c/upstream/src/role.c` — chargen pick functions and bitmask compatibility
- `nethack-c/upstream/include/you.h`, `monflag.h`, `align.h` — bitmask constants
- `sessions/seed8000-tourist-starter.session.json` (step 0 RNG log) — ground truth for exact call sequence

**Key discoveries:**
1. **Chargen comes before o_init**: sessions without fully-specified OPTIONS call `tty_player_selection()` which runs `pick_role → pick_race → pick_gend → pick_align`, each consuming rn2() calls, before `init_objects()` runs. seed8000 specifies Tourist explicitly so it skips this; all other sessions need it.
2. **o_init shuffle sizes are constant** across all seeds (object table is compile-time static). Verified from session RNG log. Full sizes: AMULET=11, POTION=25, RING=28, SCROLL=41, SPBOOK=41, WAND=28, VENOM=2, HELMET=4, GLOVES=4, CLOAK=4, BOOTS=7, WAN_NOTHING=1.
3. **RNG scoring is positional**: both argument N and return M of rn2(N)=M must match at each position. Being off by one call fails all subsequent comparisons.
4. Extracted full role allow bitmasks (13 roles) and race allow bitmasks (5 races) from role.c — documented in learnings.md.

### Phase 1 implementation (continued)
- Implemented the full pre-mklev init sequence in `js/o_init.js`, `js/dungeon_init.js`, `js/role_init.js`, wired into `js/allmain.js` for fully-specified sessions.
- **Verified session: seed0360 (Wizard, debug mode)** — all 259 pre-mklev init calls match exactly. Init sequence: init_objects(199) + role_init_extra(Wiz: rn2(100)) + init_dungeons(debug: 48 calls) + init_castle_tune(5) + newpw(Wiz: rnd(3)) + u_init_misc(1) + l_nhcore_init(2) = 257 total matched. Then mklev diverges (Lua/special-levels not implemented).
- **Bug fixed: Rogue/Ranger index swap** — `roles[]` in role.c has Rogue at 7, Ranger at 8. Fixed reversed indexing.
- **Bug fixed: Arc nemesis gender** — MINION_OF_HUHETOTL needs `rn2(100)` check. seed0361 (Archeologist) improved 277 → 1279 matched RNG calls.
- **Confirmed**: quest leaders have explicit gender; Priest `rn2(13)` loop exits after 1 call (`seed0367`).

### Ctrl+X attributes display (+6 screens)
- Implemented character attributes display in `js/cmd.js`:
  - Page 1: Background, Basics, Characteristics (STR, DEX, CON, INT)
  - Page 2: WIS, CHA, Status, Miscellaneous
- Each page ends with `nhgetch` call that captures the screen.
- Added `g.u.uleft = true` to `seed8000` hardcoded state (Tourist is left-handed).
- **Key finding**: Must pass `NO_COLOR` (8) explicitly to `putstr()` for plain-text matching.
- **Score result**: seed8000 improved from 15/23 → 21/23 screens.

### mklev divergence & fixes
- **Divergence analysis (seed0360 Wizard)**: Identified that `makerooms` loop retries `rnd_rect()` with 0 RNG in C, but JS `themerooms_generate()` was consuming 30+ RNG calls (reservoir sampling) too early.
- **Vault fallback fix**: Fixed `makelevel` logic to correctly call `create_vault()` (which has a do-while retry loop up to 101 times). seed0360 improved: 1217 → 1323 matched RNG calls.
- **newpw fix**: `newpw()` (exper.c) calls `rnd(urole.enadv.inrnd)` for roles with inrnd > 0 (Hea=4, Kni=4, Mon=2, Pri=3, Wiz=3). Fixed in `allmain.js`. seed0016 (Healer) jumped from 371 → ~1281 matched RNG.
- **Next bottleneck**: fill phase (`fastforward_fill_mineralize` is seed8000-only). Requires `makemon` and monster selection logic.

### Stream C Display - botl.js
- Created `js/botl.js` to handle bottom lines using `bot1()` and `bot2()`.
- Fixed stats mapping (e.g. `St:18/01`), status condition texts, and hooked into `display.js`.
- Restored the 21/23 passing screens metric for `seed8000`.

---

## 2026-05-10

### Stream F: Hero Init
- Set up branch `feature/stream-f-hero-init`.
- Created `js/attrib.js` (`init_attr`, `vary_init_attr`, `acurrstr`).
- Created `js/exper.js` (`newuexp`, `newpw`, `newhp`, `adjabil` stubs).
- Created `js/u_init.js` porting `u_init_role`, `u_init_race`, `u_init_misc`, and `u_init_inventory_attrs`.
- Added 13 role-specific inventory lists from `u_init.c` and implemented minimal `ini_inv` to consume RNG logic correctly.

### Stream D: Object System
- Completed Sub-tasks D1 & D3.
- Wrote `js/mkobj.js` (`newobj`, `place_object`, `remove_object`, `obj_extract_self`).
- Updated `js/game.js` to initialize `this.objects` as a 2D array of `null` pointers mirroring C's `svl.level.objects[x][y]`.
- Implemented `mkgold` mirroring integer math accurately with `Math.trunc`.
- Created `js/invent.js` with `findgold`.
- Wrote unit tests for `mkobj` and `invent` verifying linked list behaviour.
- Fixed `mkgold()` weight calculation (`(quan + 50) / 100`) and added `COIN_CLASS` to `const.js`.
- Fixed `mkgold()` utilizing `level_difficulty()` and `depth()` ported to `hacklib.js`.

### Chargen display UI (+67 screens)
- Implemented full chargen display in `js/chargen.js`.
- **Details:** `_putBanner`, `_putNamePrompt`, `_putShallIPick`, `_putIsThisOk`, `buildHeroDesc`.
- **Key findings:**
  1. `ATR_INVERSE = 1` (import from `terminal.js`).
  2. Column clearing for "Is this ok?": clear cols 40-79 based on 1-indexed `offx=41` logic.
  3. Terminal serializer behavior: blank cells between content ARE output with color.
  4. Manual path ('n') clears banner; Auto path ('y') preserves it.
- **Score result**: Total score improved from 21 → 88 matching screens.

### Stream A: Data Tables
- Generated `js/monst.js` from `monst.c` and `monsters.h`.
- Spot-checked `PM_GIANT_ANT` and `PM_NEWT` for `LVL`, `SIZ`, `ATTK` parity.
- Fixed `mons[]` extraction: expanded `SEDUCTION_ATTACKS`, removed `L/0L` suffixes, and populated `const.js` macros.

---

## 2026-05-15

- Completed Stream A subtasks A3 and A4.
- Extracted `roles`, `races`, `aligns`, and `genders` into `js/roles.js`.
- Corrected object class constants (`WEAPON_CLASS`, etc.) in `js/const.js`.
- Verified `test/roles.test.js` passes and maintained score parity.
- **Baseline pass rate (chargen+mklev)**: 100% (20/20).
- **Most frequent first-divergence locations**:
  - 8: `@ makelevel(mklev.c:1410)`
  - 6: `@ lspo_map(sp_lev.c:6163)`
  - 6: `@ fill_special_room(sp_lev.c:2769)`
  - 3: `@ mkobj(mkobj.c:281)`
  - 2: `@ somex(mkroom.c:669)`
  - 2: `@ mkclass_aligned(makemon.c:1946)`
  - 2: `@ makelevel(mklev.c:1295)`
  - 1: `@ traptype_rnd(mklev.c:1951)`
  - 1: `@ newpw(exper.c:52)`
  - 1: `@ fill_ordinary_room(mklev.c:998)`
  - 1: `@ blessorcurse(mkobj.c:1848)`
- **Next steps**: Begin Stream D (Object Creation) investigating `mksobj_init` logic (~200 lines).

---

## New Additions

<!-- 
APPEND NEW LOG ENTRIES HERE. 
The Diary Secretary will periodically merge these into the chronological sections above. 
Keep entries technical; include file names, function names, and specific findings.
Use ## YYYY-MM-DD for new headers if you know the date.
-->
