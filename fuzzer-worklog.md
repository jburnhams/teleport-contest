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

## 2026-05-11 05:27 - Second Fuzzer Success

**Target**: `moves: 0`, `role: Knight`

### Divergence Found
- **Seed**: `7960`
- **Session**: `fuzz-sessions/fuzz-7960-knight-0moves.session.json`
- **Divergence**: RNG call #1055 (`rn2(100)=97` vs `rn2(3)=0`)
- **C Context**: `@ fill_special_room(sp_lev.c:2763)`

### Analysis & Fix
- **Root Cause**: The C codebase calls `fill_special_room` for special rooms such as vaults, where it consumes RNG to place gold (`rn1`). In JS, this was entirely missing, skipped over by `fastforward_fill_mineralize()`.
- **Fix**: Removed `fastforward_fill_mineralize()` from `js/allmain.js` and implemented `fill_special_room()` inside `js/mklev.js`. Replicated `makelevel()` structure. A new divergence now occurs at `rndmonst_adj` because random monsters aren't yet properly generating.

<!-- 
APPEND NEW FUZZING RESULTS HERE.
Include timestamp, seed, moves, divergence point, and fix status.
-->
