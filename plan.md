# Plan

Ordered implementation roadmap. Complete items top-to-bottom — each unlocks RNG parity for more sessions.

---

## Phase 1 — RNG parity foundation (unblocks all sessions)

The fastforward.js scaffolding must be replaced with real implementations, in order:

1. **Chargen RNG** (`nethack-c/upstream/src/role.c` → `js/chargen.js`)  [PREREQUISITE — happens before o_init]
   - `pick_role(racenum, gendnum, alignnum, pickhow)` — counts valid roles, calls rn2(count)
   - `pick_race(rolenum, gendnum, alignnum, pickhow)` — same pattern for races
   - `pick_gend(rolenum, racenum, alignnum, pickhow)` — same for genders
   - `pick_align(rolenum, racenum, gendnum, pickhow)` — same for alignments
   - For RANDOM selections, all four run in order: role→race→gend→align (tty_player_selection order)
   - Bitmask compatibility matrices extracted from role.c — see learnings.md

2. **`o_init` — object shuffle** (`nethack-c/upstream/src/o_init.c` → `js/o_init.js`)
   - Shuffles: randomize_gem_colors (3 calls), then AMULET(11), POTION(25), RING(28), SCROLL(41), SPBOOK(41), WAND(28), VENOM(2), sub-ranges HELMET(4), GLOVES(4), CLOAK(4), BOOTS(7), WAN_NOTHING(1)
   - Fisher-Yates: `do { i = j + rn2(range-j); } while (objects[i].oc_name_known)` — no name_known objects at init, so exactly one rn2 per position
   - Total: ~193 RNG calls; sizes are constant across all seeds

3. **Dungeon init** — replace fastforward_pre_mklev dungeon portion
   - `init_dungeons()` consumes a block of rn2(100) calls and per-dungeon setup
   - Still needs analysis; for now keep fastforward for dungeon init, implement 1+2 above first

4. **`u_init` — hero initialization** (`nethack-c/upstream/src/u_init.c`)
   - Sets hero stats, starting inventory, role/race/gender/align from parsed nethackrc.
   - Depends on role tables (`js/roles.js` — partially present).

5. **Monster init** (`nethack-c/upstream/src/monst.c`, `mkmon.c`)
   - `makemon`, `newmonst` — needed for `mklev` fill phase and per-step monster movement.

6. **Per-step RNG calls** — replace `fastforward_step()`
   - Monster movement, regeneration, sound events, hunger tick.
   - C ref: `allmain.c:moveloop_core` → `movemon`, `regen`, `gethungry`.

---

## Phase 2 — Screen parity (unlocks screen points)

Once RNG is aligned, screens can start matching. Work through these roughly in order of session coverage:

7. **Welcome / chargen screens** — character selection prompts, lore `--More--`, welcome message.
8. **Status line (`bot`)** — HP, gold, AC, Dlvl, time, hunger, status effects.
9. **Map rendering (`docrt`, `newsym`)** — terrain, monsters, items visible to player.
10. **Message window** — `pline`, `--More--` prompts, multi-line message handling.
11. **Command dispatch (`cmd.js`)** — all movement, `s` search, `e` eat, `d` drop, `i` inventory, `z` zap, `r` read, `q` quaff, `w` wield, `W` wear, `t` throw, `#` extended commands.
12. **Inventory menus** — `invent.c` item lists, letter assignment, object naming.
13. **Shop handling** — price display, buy/sell, shopkeeper dialogue.

---

## Phase 3 — Coverage hardening

14. Special levels (Lua context, `sp_lev.c`).
15. Save / restore (`save.c`, `restore.c`) — multi-segment sessions.
16. Bones files.
17. Quest levels, Oracle, Sokoban, Castle, Gehennom.

---

## Notes

- Always check RNG match % before and after each change: `node frozen/ps_test_runner.mjs sessions/<file>.session.json`.
- Start debugging with small sessions first: `seed0016` (36 screens), `seed0009` (73 screens), `seed0006` (123 screens).
- Cross-check against C recorder output if a divergence is subtle: build with `bash nethack-c/build-recorder.sh` (requires clang, make, bison, flex).
- Chargen happens BEFORE o_init — sessions without fully-specified OPTIONS consume role/race/gend/align rn2() calls first.
- The seed8000 session (Tourist, fully specified OPTIONS) skips chargen RNG; other seeds need it.
