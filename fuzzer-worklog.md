# Fuzzer Worklog

Record of fuzzing sessions, discovered divergences, and fixes.

---

## 2026-05-10 07:52 - Initial Fuzzer Success

**Target**: `moves: 0`, `role: Tourist` (random)

### Divergence Found
- **Seed**: `6149`
- **Session**: `fuzz-sessions/fuzz-6149-tourist-0moves.session.json`
- **Divergence**: RNG call #1023 (`rn2(10)=1` vs `rn2(8)=1`)
- **C Context**: `@ fill_ordinary_room(mklev.c:990)`

### Analysis & Fix
- **Root Cause**: Investigating. It appears C is calling `rn2(10)` (fountain check) while JS is still calling `rn2(8)` (trap check). This implies a logic difference in the loop control or `level_difficulty()` calculation.
- **Fix**: Pending investigation. The fuzzer successfully isolated this divergence in a 0-move session.

---

## New Additions

<!-- 
APPEND NEW FUZZING RESULTS HERE.
Include timestamp, seed, moves, divergence point, and fix status.
-->

## 2026-05-10 18:25 - `rn2(100)` chance check and fill sampling for themed rooms

**Target**: `moves: 0`, `role: Healer` (gnome)

### Divergence Found
- **Seed**: `8340`
- **Session**: `fuzz-sessions/fuzz-8340-healer-0moves.session.json`
- **Divergence**: RNG call #349 (`rn2(1) = 0` vs `rn2(3) = 2`)
- **C Context**: `@ nh.rn2 src=themerms.lua:1039 parent=room([C]:-1)`

### Analysis & Fix
- **Root Cause**: The JS code missed the inner reservoir sampling loop that runs when a `themerooms` meta configuration selects a room type that specifies a `themeroom_fill` (like `Default room with themed fill`). Also missed the `rn2(100)` chance check called from `build_room` via `create_room`.
- **Fix**: Added `THEMEROOM_FILLS_META` and ported the reservoir sampling logic for fill contents into `themerooms_generate`. Shifted the logic so the fill sampling properly follows room creation where the room's `rlit` property becomes accessible to evaluate lighting requirements accurately.
## New Additions
- Fixed an RNG divergence around `dig_corridor` -> `mksobj_at(BOULDER)` -> `next_ident()`. The divergence happened because `game.context.ident` was `undefined` since `game.context = { move: 0 }` in `js/jsmain.js` was deleting the pre-initialized `ident` property (initialized by `gstate.js:resetGame`). Replaced `game.context = { move: 0 }` with `game.context = { move: 0, ident: 2 }` to properly match C's initialization of `svc.context.ident`. This advanced the fuzz test from RNG call 1315 to 1642.
