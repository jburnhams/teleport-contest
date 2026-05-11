# Stream E — Monster System

**Can start: After A** | **Dependencies: A (mons[] array)** | **Blocks: B4+, B6**

Port the monster creation and movement system. Monsters are placed during mklev and move every turn — both consume significant RNG.

**Branch:** `feature/stream-e-monster-system`
**Files touched:** `js/mkmon.js` (new), `js/mon.js` (new), `js/monmove.js` (new), `js/mondata.js` (new), `js/dog.js` (new)

---

## E1. Monster struct and management
- [x] Read C `include/monst.h` — the `monst` struct
- [x] Define JS monster shape with all fields
- [x] Port `newmonst()`, monster linked list (`fmon`), `place_monster()`, `m_at(x,y)`

## E2. mondata.js — data helpers
- [x] Port `monsndx()`, species checks, movement-type helpers from mondata.c

## E3. makemon — monster creation (CRITICAL for mklev RNG)
- [ ] Port `makemon(ptr, x, y, mmflags)` from makemon.c
- [x] Port `rndmonst()` / `rndmonnum()` — random monster selection
- [ ] Port `goodpos()` / `enexto()` — valid placement
- [ ] Port monster HP, speed, level adjustment
- [ ] Port `m_initweap()` / `m_initinv()` — monster starting items (depends on D2)
- [ ] Port `m_initgrp()` — monster groups
- [ ] Port `peace_minded()` / `set_malign()`

## E4. Pet creation
- [ ] Port `makedog()` / `initedog()` from dog.c
- [ ] Handle `preferred_pet` option

## E5. Monster movement (per-turn)
- [ ] Port `movemon()` / `mcalcmove()` from mon.c
- [ ] Port `m_move()` from monmove.c — individual AI
- [ ] Port `dochugw()` / `dochug()` — main monster turn logic
- [ ] Handle special movement types

## E6. Monster misc per-turn
- [ ] Port `dosounds()`, `dmonsfree()` from mon.c / sounds.c

---

## Notes
- E3 is the mklev prerequisite — its RNG must match C exactly
- E5 is needed by Stream B6 (per-step game loop)
- E3 `m_initweap/m_initinv` depends on Stream D — can stub initially
