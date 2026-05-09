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
7  Ran: MH_HUMAN|MH_ORC            | ROLE_MALE|ROLE_FEMALE | ROLE_CHAOTIC
8  Rog: MH_HUMAN|MH_ELF|MH_GNOME|MH_ORC | ROLE_MALE|ROLE_FEMALE | ROLE_NEUTRAL|ROLE_CHAOTIC
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
