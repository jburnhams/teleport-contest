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
