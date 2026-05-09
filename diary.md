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
