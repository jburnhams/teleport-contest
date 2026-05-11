# Learnings

Key insights discovered during the port. Add entries as discoveries are made.

---

## Core Mechanics & Infrastructure

### Scoring mechanics
- Score = count of matching 24×80 screens, not sessions. Partial credit per step.
- PRNG parity is a structural prerequisite — one off-by-one RNG call cascades through the entire dungeon and no subsequent screen can match.
- `frozen/score.sh` overlays `js/isaac64.js`, `js/terminal.js`, `js/storage.js` from `frozen/` before every run — local edits to these are silently overwritten.
- RNG scoring is positional: for each C position i, both the argument N and return value M of `rn2(N)=M` must match. Even if you consume the right total count, being off by one position fails all subsequent matches.

### Environment & Tools
- **CRLF / WSL**: `frozen/score.sh` and `frozen/set-category.sh` shipped with Windows CRLF line endings, breaking bash on WSL (`$'\r': command not found`). Fixed with `sed -i 's/\r//' <file>`.
- **Screen comparison**: Semantic, not byte-exact. `frozen/screen-decode.mjs` renders cells via `renderCell()` before comparing. DEC line-drawing chars (`\x0e` + 'l') and Unicode box chars ('┌') compare as EQUAL. Map screens can match even though `terminal.serialize()` raw bytes differ from the session JSON.
- **ANSI Colors**: `display.putstr` defaults to `CLR_GRAY` (7) -> `\x1b[37m`. Must pass `NO_COLOR` (8 -> ANSI 39) explicitly when writing text that should match plain C output.

---

## PRNG & Seeding

### Contexts & Evaluation
- Three independent PRNG contexts: core (gameplay), Lua (special levels), display (hallucination). All three must be reproduced in the correct interleaved order.
- JavaScript evaluates function arguments left-to-right, matching clang's behaviour. The C recorder is built with clang for exactly this reason — gcc evaluates right-to-left and produces a completely different RNG sequence.
- The seed is passed as a 64-bit integer, split into 8 little-endian bytes, and fed to ISAAC64 (`js/rng.js:initRng`).

### fastforward.js
- Hardcoded RNG replay for **seed8000 only**. Never generalizes. Must be replaced function-by-function with real C ports.
- Covers: pre-mklev startup (o_init shuffles, dungeon init, u_init_misc), post-mklev startup (u_init_role, ini_inv, attributes, moveloop preamble), and per-step monster/regen/sound/hunger calls.
- The pre-mklev block alone consumes ~303 RNG calls (session indices 0–308).
- **First divergence point**: All non-seed8000 sessions diverge very early. Root cause: `o_init` and `u_init` are not implemented — the fastforward block fakes them only for seed8000's exact RNG values.

---

## Game Initialization & Chargen

### Ordering & Timing
- **Chargen happens BEFORE o_init**: For sessions without fully-specified OPTIONS, the game calls `tty_player_selection()` to prompt for role/race/gender/alignment. These `pick_role/race/gend/align` calls consume RNG BEFORE `init_objects()` runs.
- Call order inside `tty_player_selection`: pick_role → pick_race → pick_gend → pick_align.
- `pick_role(racenum, gendnum, alignnum, pickhow)` counts valid roles matching constraints and calls `rn2(count)`. `pick_race`, `pick_gend`, `pick_align` follow the same pattern.

### Role & Race Logic
- **role_init() RNG pattern** (C ref: role.c lines 2022–2078):
  1. **Leader gender**: `is_neuter→2, is_female→1, is_male→0, else rn2(100)<50`. ALL quest leaders have explicit M2_MALE or M2_FEMALE, so NO rn2(100) calls here for any role.
  2. **Nemesis gender**: same logic. Only two nemeses lack explicit gender flags → rn2(100):
     - Arc (0): MINION_OF_HUHETOTL — no M2_MALE/M2_FEMALE/M2_NEUTER
     - Wiz (12): DARK_ONE — no M2_MALE/M2_FEMALE/M2_NEUTER
     - All other nemeses: explicit gender → no rn2
  3. **Priest pantheon**: `while (!roles[pantheon].lgod && ++trycnt < 100) pantheon = randrole(FALSE)`. Only Priest has `lgod=NULL`, so only Priest calls `rn2(13)` here. One call usually suffices.
- **Role index order**: **Rogue (7) precedes Ranger (8)** — this is intentional in NetHack (comment in role.c: "Rogue precedes Ranger so that use of `-R' on the command line retains its traditional meaning").
- **newpw() enadv.inrnd per role**: `newpw()` (exper.c, called from u_init at ulevel=0) calls `rnd(urole.enadv.inrnd)` if > 0. Role values:
  - Arc=0, Bar=0, Cav=0, **Hea=4**, **Kni=4**, **Mon=2**, **Pri=3**, Rog=0, Ran=0, Sam=0, Tou=0, Val=0, **Wiz=3**.

### Chargen Terminal Mechanics
- **Banner placement**: `tty_init_nhwindows()` writes the copyright banner at rows 4-7. The banner line with "Version X.Y.Z" is normalized away by the scorer. Use `NO_COLOR` for all banner/prompt writes.
- **"Is this ok?" overlay column clearing**: C calls `docorner(offx=41)` → `tty_curs(BASE_WINDOW, 41, y); cl_end()`. NetHack columns are 1-indexed, so col 41 (1-indexed) = col 40 (0-indexed). `cl_end()` clears from col 40 to EOL. Fix: clear cols 40-79.
- **"Is this ok?" option columns**: All options are written at col 41 (0-indexed):
  - Row 4: "y * Yes; start game" (selected, asterisk marker)
  - Row 5: "n - No; choose role again" (unselected)
  - Row 6: "a - Not yet; choose another name" (normalized away)
  - Row 7: "q - Quit"
  - Row 8: "(end)"
- **Manual vs auto chargen display state**:
  - Auto ('y'): no menus shown, banner stays at rows 4-7.
  - Manual ('n'): C's role menu is full-screen, clears the entire display. After menu sequence, banner and name-prompt are gone. Fix: `display.clearScreen()` before `_putIsThisOk` for the manual path.

---

## Data Extraction & Reference Data

### Bitmask constants
```
MH_HUMAN=0x08, MH_ELF=0x10, MH_DWARF=0x20, MH_GNOME=0x40, MH_ORC=0x80
ROLE_MALE=0x1000, ROLE_FEMALE=0x2000
ROLE_LAWFUL=0x04, ROLE_NEUTRAL=0x02, ROLE_CHAOTIC=0x01
ROLE_RACEMASK=0x0ff8, ROLE_GENDMASK=0xf000, ROLE_ALIGNMASK=0x07
ROLE_NONE=-1, ROLE_RANDOM=-2, ROLE_GENDERS=2, ROLE_ALIGNS=3
```

### Role `allow` masks (indices 0–12)
```
0  Arc: MH_HUMAN|MH_DWARF|MH_GNOME | ROLE_MALE|ROLE_FEMALE | ROLE_LAWFUL|ROLE_NEUTRAL
1  Bar: MH_HUMAN|MH_ORC             | ROLE_MALE|ROLE_FEMALE | ROLE_NEUTRAL|ROLE_CHAOTIC
2  Cav: MH_HUMAN|MH_DWARF|MH_GNOME | ROLE_MALE|ROLE_FEMALE | ROLE_LAWFUL|ROLE_NEUTRAL
3  Hea: MH_HUMAN|MH_GNOME          | ROLE_MALE|ROLE_FEMALE | ROLE_NEUTRAL
4  Kni: MH_HUMAN                   | ROLE_MALE|ROLE_FEMALE | ROLE_LAWFUL
5  Mon: MH_HUMAN                   | ROLE_MALE|ROLE_FEMALE | ROLE_LAWFUL|ROLE_NEUTRAL|ROLE_CHAOTIC
6  Pri: MH_HUMAN|MH_ELF            | ROLE_MALE|ROLE_FEMALE | ROLE_LAWFUL|ROLE_NEUTRAL|ROLE_CHAOTIC
7  Rog: MH_HUMAN|MH_ORC            | ROLE_MALE|ROLE_FEMALE | ROLE_CHAOTIC
8  Ran: MH_HUMAN|MH_ELF|MH_GNOME|MH_ORC | ROLE_MALE|ROLE_FEMALE | ROLE_NEUTRAL|ROLE_CHAOTIC
9  Sam: MH_HUMAN                   | ROLE_MALE|ROLE_FEMALE | ROLE_LAWFUL
10 Tou: MH_HUMAN                   | ROLE_MALE|ROLE_FEMALE | ROLE_NEUTRAL
11 Val: MH_HUMAN|MH_DWARF          | ROLE_FEMALE           | ROLE_LAWFUL|ROLE_NEUTRAL
12 Wiz: MH_HUMAN|MH_ELF|MH_GNOME|MH_ORC | ROLE_MALE|ROLE_FEMALE | ROLE_NEUTRAL|ROLE_CHAOTIC
```

### Race `allow` masks
```
0 hum: MH_HUMAN | ROLE_MALE|ROLE_FEMALE | ROLE_LAWFUL|ROLE_NEUTRAL|ROLE_CHAOTIC
1 elf: MH_ELF   | ROLE_MALE|ROLE_FEMALE | ROLE_CHAOTIC
2 dwa: MH_DWARF | ROLE_MALE|ROLE_FEMALE | ROLE_LAWFUL
3 gno: MH_GNOME | ROLE_MALE|ROLE_FEMALE | ROLE_NEUTRAL
4 orc: MH_ORC   | ROLE_MALE|ROLE_FEMALE | ROLE_CHAOTIC
```
Gender indices: 0=male, 1=female. Align indices: 0=chaotic, 1=neutral, 2=lawful.

### Extraction & Macros
- **Automated extraction**: `scripts/extract-role.py` and `scripts/parse_roles_to_js.js` parse the `roles` and `races` arrays directly from `role.c`.
- **C Macros**: `STR18(x)` from C translates to `18 + x`.
- **Missing `_CLASS` constants**: `BALL_CLASS` is 15, `CHAIN_CLASS` is 16, `VENOM_CLASS` is 17.

### Object & Monster Reference
- **o_init shuffle sizes** (constant across seeds):
  - `randomize_gem_colors()`: rn2(2), rn2(2), rn2(4) — always exactly 3 calls
  - AMULET shuffle: rn2(11)..rn2(1) — 11 calls
  - POTION shuffle: rn2(25)..rn2(1) — 25 calls
  - RING shuffle: rn2(28)..rn2(1) — 28 calls
  - SCROLL shuffle: rn2(41)..rn2(1) — 41 calls
  - SPBOOK shuffle: rn2(41)..rn2(1) — 41 calls
  - WAND shuffle: rn2(28)..rn2(1) — 28 calls
  - VENOM shuffle: rn2(2)..rn2(1) — 2 calls
  - Sub-range HELMET: 4, LEATHER_GLOVES: 4, CLOAK_OF_PROTECTION: 4, SPEED_BOOTS: 7.
  - WAN_NOTHING direction: rn2(2) — 1 call
- **Fisher-Yates inner loop**: `do { i = j + rn2(range - j); } while (objects[i].oc_name_known)` — for the shuffle classes used, no object is name-known at init time, so it's always exactly one rn2 per position.
- **Nemesis/Leader Monster Gender Flags**:
  - All quest leaders: LORD_CARNARVON, PELIAS, SHAMAN_KARNOV, etc. — all have explicit `M2_MALE` or `M2_FEMALE`.
  - Nemeses with explicit gender: THOTH_AMON (M), CHROMATIC_DRAGON (F), etc.
  - Nemeses with NO gender (random → `rn2(100)`): MINION_OF_HUHETOTL (Arc), DARK_ONE (Wiz).

---

## Level Generation & Dungeon Logic

### Modes & Checks
- **init_dungeons mode**:
  - **Debug mode**: skips ALL chance rn2(100) calls. Only calls: first Lua shuffle, depth rn2 for ranged dungeons, parent_dlevel rn2, place_level rn2.
  - **Normal mode**: adds 9 dungeon chance rn2(100) + 37 level chance rn2(100) calls = 46 extra rn2 calls.
- **Dungeon chance checks**: Default chance=100. A chance check only skips if `chance <= rn2(100)` AND chance is <100 (bigrm has chance=40).

### Room & Vault Logic
- **vault fallback**: C makelevel:1334: `else if (rnd_rect() && create_vault())`. `create_vault()` calls `create_room` with vault=TRUE. The do-while loop retries `rnd_rect()` up to 101 times. For seed0360: 1 outer rnd_rect + 101 inner = 102 consecutive rn2(2) at positions 1217–1318.
- **fill phase**: `fastforward_fill_mineralize()` is seed8000-only. Different sessions have 6–9 fillable rooms. Requires real implementation:
  1. `rn2(fillable_room_count)` for bonus-item room.
  2. `fill_ordinary_room` per room → `makemon` (random monster selection via `rndmonst_adj`).
  3. `fill_special_room` per special room.
- **mklev makerooms divergence (seed0360)**: Root cause: `themerooms_generate()` was running 30 reservoir-sampling `rn2()` calls before checking if a candidate rect is large enough. C performs the small-rect check BEFORE reservoir RNG.

---

## State & Object Management

### Object Management
- **`place_object`**: Places non-boulder objects underneath boulders. Inserts below `BOULDER`s if needed.
- **`game.level.objects`**: Must be initialized as a 2D array.
- **Linked Lists**: Extract functions (`extract_nexthere`, `extract_nobj`) must return the new head pointer.

### u_init and exper
- `u_init_role` runs first (inventory/money), then `u_init_race`.
- `u_init_misc` computes `newpw` and `newhp`.
- `ini_inv`: invokes `mksobj` for specific types or `mkobj` for `UNDEF_TYP`. Stubbed inner RNG (e.g., `rnd(2)` for `next_ident()` and `rn2(4)` for `blessorcurse` over specific scrolls and potions).

---

## UI & Display Specifics

### Attribute Screens (Ctrl+X)
- **Display pattern**: Two-page display using `display.clearScreen()` + `display.putstr(NO_COLOR)` + `display.setCursor()` + `nhgetch()`. Each nhgetch call triggers `_preNhgetchHook`, capturing the screen. The two calls produce screens[17] and screens[18] in seed8000.
- **God names for Tourist (index 10)**: Blind Io (lawful), The Lady (neutral), Offler (chaotic).
- **Dungeon name**: strip leading "The " from `game.dungeons[0].dname` to get "Dungeons of Doom".
- **Energy string logic**: "both" if en==enmax==2, "a single" if 1, "all N" if N>2 and full, otherwise "N out of M".

### Terminal Serializer
- Outputs EVERY cell from `firstCol` to `lastCol`, including blank (ch=' ') cells.
- Blank cells between non-blank cells produce color-coded spaces. `screensVisuallyEqual()` ignores color differences on space cells.

---

## New Additions

- `place_object` places non-boulder objects underneath boulders. It follows `game.level.objects[x][y]` and inserts below `BOULDER`s if needed.
- `game.level.objects` must be initialized as a 2D array, rather than a flat array as originally seen.
- Extract functions (`extract_nexthere`, `extract_nobj`) should return the new head pointer. In JS, we cannot pass head pointers by reference directly unless they are encapsulated in an object property, so functions return the new head.

## Monst and ID Generation
- `DEADMONSTER` macro in C translates to `mon.mhp < 1`. Checking whether `mhp` is below 1 is necessary, especially because `DEADMONSTER(mon)` check comes before asserting vault guards in `place_monster()`, hence they can theoretically have 0 HP and trigger impossible states.
- The `next_ident()` function maintains ID for generated objects and monsters and is statefully shared via `svc.context.ident`. Ported this to `game.context.ident`, initialized on `resetGame()`, to ensure matching PRNG loops with `rnd(2)` calls.
- `m_at(x, y)` macro directly wraps `svl.level.monsters[x][y]` in C, bypassing `mon.mburied` flag when `mburied` isn't compiled. Handled using simple map checks in JS.
- `monsndx()` implementation in C resolves pointer differences (`ptr - mons`). In JS, this maps directly to `mons.indexOf(ptr)` avoiding the need for a separate `.pmidx` field on every monster struct, as Javascript maintains exact object reference identities to the generated constants table array elements.

<!-- 
APPEND NEW LEARNINGS HERE. 
The Librarian will periodically integrate these into the thematic sections above. 
Keep entries detailed; include C references, bitmasks, and specific RNG counts.
-->

- If tests throw a TypeError in `isaac64.js` (e.g., 'Cannot read properties of undefined (reading 'n')'), the PRNG context is missing. Ensure `initRng(seed)` is called before executing any function that consumes random numbers.
- When testing logic that modifies global compile-time arrays (like `objects[i].oc_prob`), strictly isolate changes by saving the original state in `beforeEach` and restoring it in `afterEach` to prevent test contamination.

- The `WEPTOOL`, `EYEWEAR` and `MARKER` C-macros were intentionally omitted inside `extract-objects.js` and are bypassed smoothly by falling back to subclass evaluation using their respective sub-skills (e.g., `P_PICK_AXE`, `P_FLAIL`, `P_UNICORN_HORN`) via the `oc_subtyp` field safely maintaining code consistency across tools.
