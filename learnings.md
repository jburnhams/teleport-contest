# Learnings

Key insights discovered during the port. Add entries as discoveries are made.

---

## Scoring mechanics

- Score = count of matching 24×80 screens, not sessions. Partial credit per step.
- PRNG parity is a structural prerequisite — one off-by-one RNG call cascades through the entire dungeon and no subsequent screen can match.
- `frozen/score.sh` overlays `js/isaac64.js`, `js/terminal.js`, `js/storage.js` from `frozen/` before every run — local edits to these are silently overwritten.
- RNG scoring is positional: for each C position i, both the argument N and return value M of `rn2(N)=M` must match. Even if you consume the right total count, being off by one position fails all subsequent matches.

## CRLF / WSL

- `frozen/score.sh` and `frozen/set-category.sh` shipped with Windows CRLF line endings, breaking bash on WSL (`$'\r': command not found`). Fixed with `sed -i 's/\r//' <file>`.

## PRNG

- Three independent PRNG contexts: core (gameplay), Lua (special levels), display (hallucination). All three must be reproduced in the correct interleaved order.
- JavaScript evaluates function arguments left-to-right, matching clang's behaviour. The C recorder is built with clang for exactly this reason — gcc evaluates right-to-left and produces a completely different RNG sequence.
- The seed is passed as a 64-bit integer, split into 8 little-endian bytes, and fed to ISAAC64 (`js/rng.js:initRng`).

## fastforward.js

- Hardcoded RNG replay for seed8000 only. Never generalizes. Must be replaced function-by-function with real C ports.
- Covers: pre-mklev startup (o_init shuffles, dungeon init, u_init_misc), post-mklev startup (u_init_role, ini_inv, attributes, moveloop preamble), and per-step monster/regen/sound/hunger calls.
- The pre-mklev block alone consumes ~303 RNG calls (session indices 0–308).

## First divergence point for non-seed8000 sessions

- All non-seed8000 sessions diverge very early (RNG match drops to ~50–1200 out of thousands).
- Root cause: `o_init` (object shuffle) and `u_init` (hero initialization) are not implemented — the fastforward block fakes them only for seed8000's exact RNG values.

## Chargen happens BEFORE o_init (critical ordering)

- For sessions without fully-specified OPTIONS in nethackrc, the game calls `tty_player_selection()` to prompt for role/race/gender/alignment. These `pick_role/race/gend/align` calls consume RNG BEFORE `init_objects()` runs.
- Call order inside `tty_player_selection`: pick_role → pick_race → pick_gend → pick_align.
- `pick_role(racenum, gendnum, alignnum, pickhow)` counts valid roles matching constraints and calls `rn2(count)`.
- `pick_race`, `pick_gend`, `pick_align` follow the same pattern.
- This means chargen must be implemented BEFORE o_init in the call sequence.

## o_init shuffle sizes (verified from session RNG logs — constant across seeds)

Object table is static (compile-time constant), so shuffle sizes never change across seeds:

- `randomize_gem_colors()`: rn2(2), rn2(2), rn2(4) — always exactly 3 calls
- AMULET shuffle: rn2(11)..rn2(1) — 11 calls
- POTION shuffle: rn2(25)..rn2(1) — 25 calls
- RING shuffle: rn2(28)..rn2(1) — 28 calls
- SCROLL shuffle: rn2(41)..rn2(1) — 41 calls
- SPBOOK shuffle: rn2(41)..rn2(1) — 41 calls
- WAND shuffle: rn2(28)..rn2(1) — 28 calls
- VENOM shuffle: rn2(2)..rn2(1) — 2 calls
- Sub-range HELMET: rn2(4)..rn2(1) — 4 calls
- Sub-range LEATHER_GLOVES: rn2(4)..rn2(1) — 4 calls
- Sub-range CLOAK_OF_PROTECTION: rn2(4)..rn2(1) — 4 calls
- Sub-range SPEED_BOOTS: rn2(7)..rn2(1) — 7 calls
- WAN_NOTHING direction: rn2(2) — 1 call

Fisher-Yates inner loop: `do { i = j + rn2(range - j); } while (objects[i].oc_name_known)` — for the shuffle classes used, no object is name-known at init time, so it's always exactly one rn2 per position.

## Role/race bitmask compatibility matrices

Bitmask constants:
```
MH_HUMAN=0x08, MH_ELF=0x10, MH_DWARF=0x20, MH_GNOME=0x40, MH_ORC=0x80
ROLE_MALE=0x1000, ROLE_FEMALE=0x2000
ROLE_LAWFUL=0x04, ROLE_NEUTRAL=0x02, ROLE_CHAOTIC=0x01
ROLE_RACEMASK=0x0ff8, ROLE_GENDMASK=0xf000, ROLE_ALIGNMASK=0x07
ROLE_NONE=-1, ROLE_RANDOM=-2, ROLE_GENDERS=2, ROLE_ALIGNS=3
```

Role `allow` masks (indices 0–12):
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

Race `allow` masks:
```
0 hum: MH_HUMAN | ROLE_MALE|ROLE_FEMALE | ROLE_LAWFUL|ROLE_NEUTRAL|ROLE_CHAOTIC
1 elf: MH_ELF   | ROLE_MALE|ROLE_FEMALE | ROLE_CHAOTIC
2 dwa: MH_DWARF | ROLE_MALE|ROLE_FEMALE | ROLE_LAWFUL
3 gno: MH_GNOME | ROLE_MALE|ROLE_FEMALE | ROLE_NEUTRAL
4 orc: MH_ORC   | ROLE_MALE|ROLE_FEMALE | ROLE_CHAOTIC
```

Gender indices: 0=male, 1=female. Align indices: 0=chaotic, 1=neutral, 2=lawful.

## role_init() RNG pattern (C ref: role.c lines 2022–2078)

Three sequential checks, all at init time, in this order:

1. **Leader gender**: `is_neuter→2, is_female→1, is_male→0, else rn2(100)<50`. ALL quest leaders have explicit M2_MALE or M2_FEMALE, so NO rn2(100) calls here for any role.

2. **Nemesis gender**: same logic. Only two nemeses lack explicit gender flags → rn2(100):
   - Arc (0): MINION_OF_HUHETOTL — no M2_MALE/M2_FEMALE/M2_NEUTER
   - Wiz (12): DARK_ONE — no M2_MALE/M2_FEMALE/M2_NEUTER
   - All other nemeses: explicit gender → no rn2

3. **Priest pantheon**: `while (!roles[pantheon].lgod && ++trycnt < 100) pantheon = randrole(FALSE)`. Only Priest has `lgod=NULL`, so only Priest calls `rn2(13)` here. One call usually suffices (the first non-Priest result exits the loop). In practice rn2(13)=11 (Valkyrie, which has lgod) for seed0367.

## Role index order (C ref: role.c roles[] array)

**Rogue (7) precedes Ranger (8)** — this is intentional in NetHack (comment in role.c: "Rogue precedes Ranger so that use of `-R' on the command line retains its traditional meaning"). Do not swap them.

## init_dungeons mode (wizard/debug vs normal)

- **Debug mode** (`playmode:debug` in OPTIONS): skips ALL chance rn2(100) calls (both dungeon and level), skips dungeon-level chance checks. Only calls: first Lua shuffle (rn2(3)+rn2(2)), depth rn2 for ranged dungeons, parent_dlevel rn2, place_level rn2.
- **Normal mode**: adds 9 dungeon chance rn2(100) + 37 level chance rn2(100) calls = 46 extra rn2 calls.
- Default chance=100 for all dungeons and levels (from `dungeon.c:1014`: `get_table_int_opt(L, "chance", 100)`). A chance check only skips if `chance <= rn2(100)` AND chance is <100 (bigrm has chance=40).

## Nemesis/leader monster gender flags summary

All quest leaders: LORD_CARNARVON, PELIAS, SHAMAN_KARNOV, HIPPOCRATES, KING_ARTHUR, GRAND_MASTER, ARCH_PRIEST, MASTER_OF_THIEVES (Rog), ORION (Ran), LORD_SATO, TWOFLOWER, NORN (Val, female), NEFERET_THE_GREEN (Wiz, female) — all have explicit M2_MALE or M2_FEMALE.

Nemeses with explicit gender: THOTH_AMON (M), CHROMATIC_DRAGON (F), CYCLOPS (M), IXOTH (M), MASTER_KAEN (M), NALZOK (M), MASTER_ASSASSIN (M), SCORPIUS (M), ASHIKAGA_TAKAUJI (M), MASTER_OF_THIEVES (M/Tou), LORD_SURTUR (M).

Nemeses with NO gender (random → rn2(100)): MINION_OF_HUHETOTL (Arc), DARK_ONE (Wiz).

## Screen comparison is semantic, not byte-exact

`frozen/screen-decode.mjs` `diffCell()` renders cells via `renderCell()` before comparing. DEC line-drawing chars (`\x0e` + 'l') and Unicode box chars ('┌') compare as EQUAL. Map screens can match even though `terminal.serialize()` raw bytes differ from the session JSON. Raw string comparison is misleading — always use the scorer output.

## putstr() color for plain-text attribute screens

`display.putstr(col, row, str, color, attr)` defaults color to `CLR_GRAY` (7), which emits `\x1b[37m` ANSI escape codes. Session JSON records plain text with no color codes. Must pass `NO_COLOR` (8 → ANSI 39 → no escape codes) explicitly when writing text that should match plain C output. Example: `display.putstr(col, row, str, NO_COLOR, 0)`.

## show_attributes (Ctrl+X) display pattern

Two-page display using `display.clearScreen()` + `display.putstr(NO_COLOR)` + `display.setCursor()` + `nhgetch()`. Each nhgetch call triggers `_preNhgetchHook`, capturing the screen and advancing `_screens[]`. The two nhgetch calls produce screens[17] and screens[18] in the seed8000 session.

God names for Tourist (index 10): Blind Io (lawful), The Lady (neutral), Offler (chaotic). Dungeon name: strip leading "The " from `game.dungeons[0].dname` to get "Dungeons of Doom" (the article comes from the sentence context). Energy string: "both" if en==enmax==2, "a single" if 1, "all N" if N>2 and full, otherwise "N out of M".

## mklev makerooms divergence pattern (seed0360)

For seed0360 (Wizard, debug mode), RNG matches through all pre-mklev init (indices 0–1217), then diverges at 1218. C has 102 consecutive `rn2(2)=? @ rnd_rect(rect.c:106)` calls at positions 1217–1318 with no other RNG interleaved, followed by `rn2(7)=5 @ generate_stairs_find_room`.

JS instead produces `rn2(7)=1 @ make_niches` at position 1218 — meaning our makerooms exits early (only 8 rooms placed, rect_cnt=2 still has rects to try), then proceeds to make_niches/generate_stairs.

Root cause: our `themerooms_generate()` unconditionally runs 30 reservoir-sampling `rn2()` calls before checking if a candidate rect is large enough for any room. C apparently performs the small-rect check BEFORE consuming reservoir RNG, so failed small rects add exactly 0 extra RNG. Fix: add early size check at the top of `themerooms_generate()` (before reservoir sampling) to return immediately if the rect is too small.
