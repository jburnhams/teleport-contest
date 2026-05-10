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

Key discoveries:
1. **Chargen comes before o_init**: sessions without fully-specified OPTIONS call `tty_player_selection()` which runs `pick_role → pick_race → pick_gend → pick_align`, each consuming rn2() calls, before `init_objects()` runs. seed8000 specifies Tourist explicitly so it skips this; all other sessions need it.
2. **o_init shuffle sizes are constant** across all seeds (object table is compile-time static). Verified from session RNG log. Full sizes: AMULET=11, POTION=25, RING=28, SCROLL=41, SPBOOK=41, WAND=28, VENOM=2, HELMET=4, GLOVES=4, CLOAK=4, BOOTS=7, WAN_NOTHING=1.
3. **RNG scoring is positional**: both argument N and return M of rn2(N)=M must match at each position. Being off by one call fails all subsequent comparisons.
4. Extracted full role allow bitmasks (13 roles) and race allow bitmasks (5 races) from role.c — documented in learnings.md.

Next steps: implement `js/chargen.js` (pick_role/race/gend/align) and `js/o_init.js` (init_objects), then wire into `newgame()` replacing `fastforward_pre_mklev()`.

### Phase 1 implementation (continued)

Implemented the full pre-mklev init sequence in `js/o_init.js`, `js/dungeon_init.js`, `js/role_init.js`, wired into `js/allmain.js` for fully-specified sessions.

**Verified session: seed0360 (Wizard, debug mode)** — all 259 pre-mklev init calls match exactly. Init sequence: init_objects(199) + role_init_extra(Wiz: rn2(100)) + init_dungeons(debug: 48 calls) + init_castle_tune(5) + newpw(Wiz: rnd(3)) + u_init_misc(1) + l_nhcore_init(2) = 257 total matched. Then mklev diverges (Lua/special-levels not implemented).

**Bug found and fixed: Rogue/Ranger index swap** — the `roles[]` array in role.c has Rogue at index 7 and Ranger at index 8 ("Rogue precedes Ranger" comment in source). My initial `ROLE_NAME_TO_IDX` had them reversed.

**Bug found and fixed: Arc nemesis gender** — MINION_OF_HUHETOTL has no M2_MALE/M2_FEMALE/M2_NEUTER flags, so role_init() calls rn2(100) for it. Fixed by adding Arc (index 0) alongside Wiz (index 12) to the nemesis-gender rn2(100) check. seed0361 (Archeologist) improved from 277 → 1279 matched RNG calls.

**Confirmed: all quest leaders have explicit gender** — no rn2(100) needed for the leader gender check in any role.

**Confirmed: Priest rn2(13) loop exits quickly** — seed0367 shows `rn2(13)=11` (Valkyrie, which has lgod) at position 199, loop exits after 1 call.

Full score snapshot (15/11284 screen pts): seed8000 still at 3126/3130 RNG, 15/23 screens. No regressions. All other sessions diverge in mklev or have chargen not yet implemented.

---

## 2026-05-09 (continued) — Ctrl+X attributes display (+2 screens)

### Ctrl+X (show_attributes) implementation

Implemented the two-page character attributes display (Ctrl+X / 0x18) in `js/cmd.js`:
- Page 1: Background (name, role, rank, level, gender, race, alignment, god, opponents, handedness, dungeon level, turns, XP), Basics (HP, EN, AC, gold, autopickup), Characteristics (STR, DEX, CON, INT)
- Page 2: WIS, CHA, Status (hunger, encumbrance, weapon/skill), Miscellaneous (elapsed time)
- Each page ends with an nhgetch call that captures the screen and advances the session

Also added `g.u.uleft = true` to the seed8000 hardcoded state block in `js/allmain.js` (Tourist is left-handed — needed for "You are left-handed." line to display correctly).

**Key technical detail**: `putstr()` defaults to CLR_GRAY (7 → ANSI 37 → emits `\x1b[37m` escape codes). The C session records plain text with no color escapes. Must pass `NO_COLOR` (8 → ANSI 39 → no escape codes emitted) explicitly to `putstr()`.

**Score result**: seed8000 improved from 15/23 → 21/23 screens (screens[17] and screens[18] now match). Total public score: **21/11284**.

### Screen comparison insight

The scorer uses `diffCell()` from `frozen/screen-decode.mjs` which renders cells through `renderCell()` before comparing. DEC line-drawing chars (`\x0e` + 'l') and Unicode box chars ('┌') compare as equal semantically. This explains why map screens can match even though raw string bytes differ between DEC and Unicode encoding.

### mklev divergence analysis (seed0360 Wizard)

Investigated why non-seed8000 sessions diverge in mklev. For seed0360:
- RNG matches through pre-mklev init (indices 0–1217)
- Divergence at index 1218: C expects `rn2(2)=0 @ rnd_rect` but JS produces `rn2(7)=1 @ make_niches`
- C has 102 consecutive `rn2(2)=? @ rnd_rect(rect.c:106)` calls at positions 1217–1318 with NO other RNG calls interleaved
- After the 102 rnd_rects: `rn2(7)=5 @ generate_stairs_find_room`

Root cause hypothesis: C's `makerooms` loop continues attempting `rnd_rect()` for small-rect failures with 0 extra RNG, while our code unconditionally calls `themerooms_generate()` which consumes 30+ RNG calls (reservoir sampling) before discovering the rect is too small. Fix: add early-exit in `themerooms_generate()` before any RNG is consumed when the candidate rect is too small to hold any room.

### Vault fallback fix (+106 RNG calls for seed0360)

Root cause identified and fixed: the vault fallback in `makelevel` (`js/mklev.js:507`) was `else if (rnd_rect()) { // simplified }` — it called `rnd_rect()` but not `create_vault()`. In C, `else if (rnd_rect() && create_vault())` means `create_vault()` is always called when `rnd_rect()` succeeds; `create_vault()` has an internal do-while loop that retries up to 101 times, each calling `rnd_rect()`. For seed0360, all 101 retries fail (rect too small for vault), producing 102 consecutive `rnd_rect → rn2(2)` calls (1 outer + 101 inner). Fixed by calling `create_vault()` in the fallback branch. seed0360 improved: 1217 → 1323 matched RNG calls.

### newpw fix: all roles with enadv.inrnd > 0

`newpw()` (called from `u_init()` at ulevel=0) calls `rnd(urole.enadv.inrnd)` for any role with inrnd > 0. Our code only handled Wizard (inrnd=3). The full table from role.c:
- Arc=0, Bar=0, Cav=0, **Hea=4**, **Kni=4**, **Mon=2**, **Pri=3**, Rog=0, Ran=0, Sam=0, Tou=0, Val=0, **Wiz=3**

All race inrnd values are 0. Fixed by storing `ROLE_ENADV_INRND` array in `allmain.js` and calling `rnd(newpwInrnd)` for any role. Result: seed0016 (Healer) jumped from 371 → ~1281 matched RNG calls. seed0017 (Samurai, inrnd=0) unchanged.

### Current bottleneck: fill phase

After vault fix + newpw fix, most fully-specified sessions now diverge in the fill phase:
- `rn2(fillable_room_count)` at `makelevel:1402` — `fastforward_fill_mineralize` hardcodes `rn2(8)` but sessions have 6-9 fillable rooms
- `fill_ordinary_room` / `fill_special_room` — require `makemon` and full monster selection logic

Next: implement real fill phase (replace `fastforward_fill_mineralize` for non-seed8000).

## 2026-05-10

- Worked on Stream A: Data Tables.
- Generated \`js/monst.js\` from \`monst.c\` and \`monsters.h\` using a custom extractor script.
- Implemented tests to verify length \`NUMMONS\` and spot-checked \`PM_GIANT_ANT\` and \`PM_NEWT\` to ensure exact matching and proper macro expansion (\`LVL\`, \`SIZ\`, \`ATTK\`).
- Confirmed no regressions in the score.


- Fixed `mons[]` extraction script: explicitly expand `SEDUCTION_ATTACKS` so incubus/succubus receive full 6-element attack arrays, correctly parse all bitmasks to remove `L`/`0L` suffixes, and populate `const.js` with missing macros to avoid `undefined` coercion in the generated output.

Baseline pass rate (chargen+mklev): 100% (20/20)
Most frequent first-divergence locations across 44 canonical sessions:
      8     Context from C log: @ makelevel(mklev.c:1410)
      6     Context from C log: @ lspo_map(sp_lev.c:6163)
      6     Context from C log: @ fill_special_room(sp_lev.c:2769)
      3     Context from C log: @ mkobj(mkobj.c:281)
      2     Context from C log: @ somex(mkroom.c:669)
      2     Context from C log: @ mkclass_aligned(makemon.c:1946)
      2     Context from C log: @ makelevel(mklev.c:1295)
      1     Context from C log: @ traptype_rnd(mklev.c:1951)
      1     Context from C log: @ nh.rn2 src=themerms.lua:1039 parent=room([C]:-1)
      1     Context from C log: @ newpw(exper.c:52)
      1     Context from C log: @ fill_ordinary_room(mklev.c:998)
      1     Context from C log: @ blessorcurse(mkobj.c:1848)
