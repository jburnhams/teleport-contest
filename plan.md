# Plan

High-level roadmap for porting NetHack 5.0 from C to JavaScript, bit-exact.

**Scope: port ALL of NetHack 5.0.** The 44 public sessions (and 44 held-out) are a scoring thermometer — they sample a fraction of the game's surface. A faithful, complete port will score well on both pools. An incomplete port that games the public sessions will fail on held-out and on Phase 2's "5.1" diff.

**Architecture principle: stay structurally faithful to the C original.** Same function names, same parameter order, same branching logic. Every JS file should name the C file it ports (`// C ref: filename.c`). This makes cross-referencing easy, reduces bugs, and prepares us for Phase 2 where a C diff must map cleanly onto our JS.

See `tasks.md` for the current granular checklist of work items.

---

## The Core Constraint: RNG Cascade

Every single RNG call must match C's, in order, or all subsequent screens fail. Progress is strictly sequential:

1. **Pre-mklev init** (chargen → o_init → dungeon_init) — ~200–400 RNG calls
2. **mklev** (rooms → corridors → fill → populate) — ~1,000–2,000 RNG calls
3. **Post-mklev** (u_init → ini_inv → moveloop preamble) — ~100–200 RNG calls
4. **Per-step game loop** (monsters → regen → sounds → hunger → command) — ~8–15 RNG calls/step
5. **Screen rendering** — earns actual points if all the above matched

---

## Phase 0 — Foundation Fixes (Immediate, high leverage)

**Goal:** Get RNG aligned past mklev for multiple sessions. Currently ALL non-seed8000 diverge in mklev.

| Task | C ref | Status |
|------|-------|--------|
| Fix `themerooms_generate` early-exit before reservoir sampling | mklev.c | TODO |
| Implement `chargen.js` — `pick_role/race/gend/align` | role.c | TODO |
| Verify pre-mklev RNG match across multiple seeds | — | TODO |

---

## Phase 1 — mklev Completion (Critical path)

**Goal:** Complete level generation — rooms, objects, monsters, traps placed with correct RNG.

| Task | C ref | Dependencies |
|------|-------|--------------|
| `objects[]` array — full object data table | objects.c, objclass.h | — |
| `mons[]` array — full monster data table | monst.c, mondata.h | — |
| `mkobj` — object creation with correct RNG | mkobj.c | objects[] |
| `makemon` — monster creation with correct RNG | makemon.c | mons[] |
| mklev fill phase — `fill_rooms`, `mkroom_contents` | mklev.c, mkroom.c | mkobj, makemon |
| `mineralize` — gold/gem deposits | mklev.c | mkobj |
| Traps — `maketrap`, trap types, placement | trap.c | — |
| Special rooms — shops, altars, etc. | mkroom.c | mkobj, makemon |

**Outcome:** Delete `fastforward_fill_mineralize()`. mklev RNG matches for multiple seeds.

---

## Phase 2 — Post-mklev Init & Hero Setup

**Goal:** Get from mklev → first screen with correct game state.

| Task | C ref | Dependencies |
|------|-------|--------------|
| `u_init` — role-specific hero setup, stats, skills | u_init.c | objects[], role tables |
| `ini_inv` — starting inventory generation | u_init.c | mkobj |
| `init_attr` / `initattributes` — stat init | attrib.c | role tables |
| `newpw` — energy calculation (generalised) | exper.c | role tables |
| Moveloop preamble — `findgold`, `vision_reset` etc. | allmain.c | u_init, ini_inv |

**Outcome:** Delete `fastforward_post_mklev()`. Hero state correct for any role/seed.

---

## Phase 3 — Display & Status (First real screen points)

**Goal:** First screen of each session matches — welcome screen + map + status line.

| Task | C ref |
|------|-------|
| `botl.js` — proper status line rendering | botl.c |
| `newsym` — monsters, objects, traps on map | display.c |
| Welcome message — role-specific greeting | allmain.c |
| `docrt` — full map redraw with remembered glyphs | display.c |
| Cursor position — correct placement after each action | display.c |
| Terminal output format — exact ANSI/DEC matching | wintty.c |

**Outcome:** Screen 0 (welcome) matches for multiple sessions. Points start climbing.

---

## Phase 4 — Per-Step Game Loop (Turns working)

**Goal:** Replace `fastforward_step()` with real per-turn logic.

| Task | C ref |
|------|-------|
| `movemon` — monster movement each turn | mon.c, monmove.c |
| `mcalcmove` — monster speed system | mon.c |
| `regen` — HP/energy regeneration | allmain.c |
| `gethungry` — hunger system | eat.c |
| `dosounds` — random ambient sounds | sounds.c |
| `moveloop_core` — proper turn sequencing | allmain.c |

**Outcome:** Delete `fastforward_step()`. Turns advance correctly for all sessions.

---

## Phase 5 — Command Dispatch (All ~70 commands)

**Goal:** Port the complete `cmd.c` dispatch table. All of it — not just what sessions exercise.

Priority by RNG impact, then code complexity:

- **P0:** Movement, wait, search (core loop)
- **P1:** Inventory, pickup, drop, eat, quaff, read, wield, wear, takeoff, open, close
- **P2:** Zap, cast, throw, kick, apply, pay, engrave, put on
- **P3:** All extended commands, stairs, pray, offer, look, call, name, etc.

---

## Phase 6 — Inventory, Objects & Menus

| Task | C ref |
|------|-------|
| Inventory letter assignment | invent.c |
| Object naming/identification | objnam.c |
| Menu system (pick-one, pick-many) | wintty.c |
| Item descriptions | — |

---

## Phase 7 — Combat & Damage

| Task | C ref |
|------|-------|
| `uhitm` — player attacks monster | uhitm.c |
| `mhitu` — monster attacks player | mhitu.c |
| `mhitm` — monster vs monster | mhitm.c |
| Death handling | end.c |
| Weapon/armor effects | weapon.c, worn.c |

---

## Phase 8 — Multi-level & Special Features

| Task | C ref |
|------|-------|
| `goto_level` — level change | do.c |
| Level memory / per-level state | — |
| `sp_lev` — Lua special levels | sp_lev.c |
| Mines, Sokoban, Oracle | sp_lev.c |
| Save/restore | save.c, restore.c |
| Bones files | bones.c |

---

## Target JS Module Map

Mirrors the C source structure. Each JS file ports the corresponding C file.

```
js/
├── jsmain.js          ← entry point (unixmain.c)           [EXISTS]
├── allmain.js          ← newgame, moveloop                  [EXISTS, partial]
├── cmd.js             ← rhack, command dispatch             [EXISTS, minimal]
├── hack.js            ← domove, domovemon                   [NEW]
├── display.js         ← newsym, docrt, flush_screen         [EXISTS, partial]
├── botl.js            ← bot, status line rendering          [NEW]
├── pline.js           ← message handling, --More--          [NEW]
├── mklev.js           ← level generation                   [EXISTS, partial]
├── mkobj.js           ← object creation                     [NEW]
├── mkmon.js           ← monster creation (makemon.c)        [NEW]
├── mon.js             ← monster movement, AI                [NEW]
├── mondata.js         ← monster data helpers                [NEW]
├── monst.js           ← mons[] array                        [NEW]
├── objects.js         ← objects[] array                     [NEW]
├── objnam.js          ← object naming                       [NEW]
├── invent.js          ← inventory management                [NEW]
├── u_init.js          ← hero initialization                 [NEW]
├── chargen.js         ← tty_player_selection                [NEW]
├── role.js            ← role/race data tables               [NEW — expand roles.js]
├── dog.js             ← pet behavior                        [NEW]
├── eat.js, do_wear.js, trap.js, shk.js, ...                 [NEW]
├── sp_lev.js, save.js, dungeon.js, attrib.js, ...           [NEW]
├── o_init.js          ← object init                         [EXISTS]
├── dungeon_init.js    ← dungeon structure init              [EXISTS]
├── role_init.js       ← role init extras                    [EXISTS]
├── rng.js             ← PRNG wrappers                      [EXISTS]
├── const.js           ← constants                           [EXISTS]
├── gstate.js          ← global state                        [EXISTS]
├── options.js         ← nethackrc parsing                   [EXISTS]
└── fastforward.js     ← SHRINKING — delete as replaced     [EXISTS]
```

---

## Key Decisions

### Data tables
The `mons[]` and `objects[]` arrays are ~5,000+ lines of structured data each. We should **auto-extract** from C headers with a script, not hand-port. This saves weeks and avoids transcription errors.

### Lua special levels
NetHack 5.0 uses Lua for special levels. Options: embed a JS Lua interpreter, or hand-translate the level definitions. Decision deferred to Phase 8 — most sessions don't reach special levels early.

### Phase 2 readiness
The contest has a Phase 2 where a "5.1" diff is applied. Our structural fidelity to C means C-side diffs can be mechanically applied to our JS. This is a major strategic advantage.

---

## Scoring Notes

- `npm run score:check` — must not regress, ever
- `node frozen/ps_test_runner.mjs sessions/<file>.session.json` — test individual sessions
- RNG match % is the leading indicator before screens match
- Push to `main` via PR only — CI score gate enforces no-regression
- Judge re-scores every 2 hours on the leaderboard
