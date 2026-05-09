# Stream B — RNG Critical Path

**Can start: NOW (tasks 1-3)** | **Dependencies: A (for task 4+), D+E (for task 5+)** | **Blocks: nothing directly**

This is the scoring-critical path. Every RNG call must match C's in order or all subsequent screens fail. Work proceeds strictly top-to-bottom within this stream.

**Branch:** `feature/stream-b-rng-foundation`
**Files touched:** `js/chargen.js` (new), `js/mklev.js`, `js/allmain.js`, `js/fastforward.js`

---

## B1. themerooms_generate early-exit ⚡ HIGH LEVERAGE
- [ ] Read C `themerooms_generate()` in mklev.c — understand size check before reservoir sampling
- [ ] Read C `rnd_rect()` in rect.c — understand how small rects are handled
- [ ] In JS `js/mklev.js`: add size check at top of `themerooms_generate()` BEFORE any rn2() calls
- [ ] Return false immediately if rect is too small (< MIN_ROOM_SIZE on either axis)
- [ ] Verify: seed0360 should now have 102 `rnd_rect` calls at positions 1217–1318
- [ ] Run `npm run score:check` — no regression, RNG% should improve for many sessions
- [ ] Update `learnings.md` with findings
- [ ] Update `diary.md`

## B2. chargen.js — pick_role/race/gend/align
- [ ] Create `js/chargen.js`
- [ ] Port `tty_player_selection()` — the top-level chargen dispatcher
- [ ] Port `pick_role(racenum, gendnum, alignnum, pickhow)` — count valid roles, call rn2(count)
- [ ] Port `pick_race(rolenum, gendnum, alignnum, pickhow)` — same pattern
- [ ] Port `pick_gend(rolenum, racenum, alignnum, pickhow)` — same
- [ ] Port `pick_align(rolenum, racenum, gendnum, pickhow)` — same
- [ ] Use bitmask compatibility matrices from `learnings.md` / `js/roles.js`
- [ ] Handle the `ROLE_RANDOM` (-2) vs `ROLE_NONE` (-1) distinction
- [ ] Wire into `allmain.js newgame()` — call for ALL sessions (remove `isFullySpecified` special-case)
- [ ] For fully-specified sessions, pick functions should return the specified value with 0 RNG calls
- [ ] Verify against 3-4 seeds: seed0360 (Wizard debug), seed0060 (Orc Rogue), seed0077 (Rogue chargen), seed0101 (Ranger)
- [ ] Run `npm run score:check`

## B3. Pre-mklev verification checkpoint
- [ ] Run scorer against all 44 sessions
- [ ] For each: check how far RNG matches through pre-mklev init
- [ ] Document any remaining pre-mklev divergences in `learnings.md`
- [ ] Fix any divergences found
- [ ] Snapshot RNG match percentages for all sessions

## B4. mklev fill phase wiring (DEPENDS ON: A, D)
- [ ] Replace `fastforward_fill_mineralize()` with real `fill_rooms()` + `mineralize()` calls
- [ ] Wire `mkobj` (from Stream D) into level population
- [ ] Wire `makemon` (from Stream E) into level population
- [ ] Verify: seed8000 mklev RNG should match without any fastforward
- [ ] Run `npm run score:check`

## B5. Post-mklev init (DEPENDS ON: A, D, F)
- [ ] Replace `fastforward_post_mklev()` with real u_init + ini_inv calls
- [ ] Remove hardcoded hero state block in `allmain.js`
- [ ] Wire `u_init()` (from Stream F) into newgame()
- [ ] Wire `ini_inv()` (from Stream F) into newgame()
- [ ] Verify: seed8000 post-mklev RNG should match without any fastforward
- [ ] Run `npm run score:check`

## B6. Per-step game loop (DEPENDS ON: E)
- [ ] Replace `fastforward_step()` with real per-turn calls
- [ ] Wire `movemon()` (from Stream E) into moveloop_core
- [ ] Port `regen()`, `gethungry()`, `dosounds()` inline or from Stream E
- [ ] Verify: seed8000 per-step RNG should match without fastforward_step
- [ ] Run `npm run score:check`

---

## Verification

```bash
# Test individual session RNG:
node frozen/ps_test_runner.mjs sessions/seed0360-wizard-world-tour.session.json
node frozen/ps_test_runner.mjs sessions/seed0060-orc-rogue-kick-search.session.json

# Full score check:
npm run score:check
```

## Notes

- B1 and B2 can be done immediately with no dependencies
- B3 is a verification checkpoint — do it after B1+B2 merge
- B4+ requires data tables from Stream A and object/monster code from D/E
- This stream produces the most score impact but is bottlenecked by its dependencies
- The `fastforward.js` file should shrink with each task — eventually to zero
