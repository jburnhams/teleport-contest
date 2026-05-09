# Fuzzer / Session Generator Plan

## Goal

Create a differential-testing harness that:
1. Generates random session stubs (seed, datetime, role/race, moves)
2. Records the canonical C output via the existing C recorder
3. Runs the same input through JS
4. Reports exactly where and how the JS output diverges

This gives a tight feedback loop — generate a session with 0 moves to isolate chargen + mklev, confirm it passes, add 1 move, confirm, etc. — rather than debugging against a 200-step fixed session.

---

## How it fits the existing infrastructure

The scoring pipeline already does most of the work:

```
gen-session.mjs   →   record-session.mjs   →   ps_test_runner.mjs
  (stub JSON)           (adds C steps)           (JS vs C diff)
```

- `record-session.mjs` already accepts any v5 session stub (seed + datetime + nethackrc + moves, **no** steps) and drives the C binary to produce the canonical steps. We just need to generate the stub.
- `ps_test_runner.mjs` already scores any `.session.json` in a given directory. We run it against our generated sessions.

**C recorder binary location:** `nethack-c/recorder/install/games/lib/nethackdir/nethack`
Must be built first via `bash nethack-c/build-recorder.sh` (requires clang, bison, flex).

---

## Session stub format (what we generate)

```json
{
  "version": 5,
  "segments": [
    {
      "seed": 1337,
      "datetime": "20000205090000",
      "nethackrc": "OPTIONS=name:Fuzz,role:Healer,race:gnome,gender:male,align:neutral\nOPTIONS=!autopickup,!tutorial\nOPTIONS=suppress_alert:3.4.3\nOPTIONS=symset:DECgraphics\nOPTIONS=disclose:yi ya yv yg yc yo\n",
      "moves": "hhhjj"
    }
  ]
}
```

No `steps` array — `record-session.mjs` fills that in from the C binary.

---

## Roles, races, genders, alignments

Valid combos must match NetHack's compatibility table. Safe initial set to randomize over:

| Role      | Compatible races            | Alignments       |
|-----------|-----------------------------|------------------|
| Archeologist | hum, dwa                 | neu, law         |
| Barbarian | hum, orc                    | neu, cha         |
| Caveman   | hum, dwa, gno               | neu, law         |
| Healer    | hum, gno                    | neu              |
| Knight    | hum                         | law              |
| Monk      | hum                         | neu, law, cha    |
| Priest    | hum, elf                    | neu, law, cha    |
| Ranger    | hum, elf, gno, orc          | neu, cha         |
| Rogue     | hum, orc                    | cha              |
| Samurai   | hum                         | law              |
| Tourist   | hum                         | neu              |
| Valkyrie  | hum, dwa                    | neu, cha         |
| Wizard    | hum, elf, gno, orc          | neu, cha         |

Gender is always valid for any role/race; pick randomly.

---

## Scripts to create

### 1. `scripts/gen-session.mjs` — stub generator

Generates a single session stub JSON and writes it to stdout or a file.

**CLI:**
```bash
node scripts/gen-session.mjs [options] > stub.json

Options:
  --seed N          PRNG seed (default: random 1–9999)
  --moves N         number of random moves to include (default: 0)
  --move-set TYPE   what moves to use: move | explore | all (default: move)
                      move:    hjklyubn only
                      explore: move + space (search) + . (wait) + s
                      all:     move + explore + i (inventory) + , (pick up) + @ (ring check)
  --role ROLE       force a role (default: random)
  --race RACE       force a race (default: random valid for role)
  --gender GENDER   male|female (default: random)
  --align ALIGN     law|neu|cha (default: random valid for role)
  --datetime STR    YYYYMMDDHHMMSS (default: random date 1990–2010)
  --out FILE        write to file instead of stdout
```

**Implementation notes:**
- Pick a random valid (role, race, align) triple from the table above
- Moves: for `move` set pick randomly from `hjklyubn`; `explore` adds `. s`; `all` adds `i , @`
- Datetime: pick a random date — moon phase and day of week affect game state, so varying it exercises more paths
- Output a minimal `OPTIONS=` nethackrc identical in structure to the canonical sessions (name, role, race, gender, align, !autopickup, !tutorial, suppress_alert, symset:DECgraphics, disclose)

---

### 2. `scripts/fuzz.mjs` — orchestrator

Drives the full pipeline for N sessions and reports results.

**CLI:**
```bash
node scripts/fuzz.mjs [options]

Options:
  --count N         sessions to generate and test (default: 10)
  --moves N         moves per session (default: 0)
  --move-set TYPE   passed through to gen-session (default: move)
  --role ROLE       pin role for all sessions (default: random each)
  --output-dir DIR  where to save generated + recorded sessions (default: fuzz-sessions/)
  --keep-all        keep passing sessions too (default: only keep failing)
  --verbose         show per-step PRNG diff on failure
  --seed-start N    start seeds at N, incrementing (default: random)
```

**Pipeline per session:**
1. Call `gen-session.mjs` to produce `fuzz-sessions/fuzz-{N}-stub.json`
2. Call `record-session.mjs` on the stub → `fuzz-sessions/fuzz-{N}.session.json`
   - Skip if C binary not found; print warning and exit
3. Run `ps_test_runner.mjs` against `fuzz-sessions/` (or a single-file temp dir)
4. Parse results JSON, accumulate pass/fail counts

**Output format:**
```
[1/10] seed=1337 Hea/gnome/neu 0 moves ... PASS (47/47 RNG, 1/1 screens)
[2/10] seed=0042 Wiz/elf/cha   0 moves ... FAIL
  RNG diverged at call #48 of 312
    expected: rn2(5)=3  (makemon @ makemon.c:421)
    got:      rn2(5)=1
  Screens: 0/1 matched

Summary: 7/10 passed
Failing sessions saved to: fuzz-sessions/
```

**Diff detail implementation:** Parse the per-step RNG arrays from the recorded session and compare against `game.getRngSlices()`. Normalize both sides (strip `@ location` annotations) before comparing.

---

### 3. `scripts/fuzz-diff.mjs` — standalone diff tool

Given a recorded session that's failing, show the detailed divergence.

**CLI:**
```bash
node scripts/fuzz-diff.mjs <session.json>
```

**Output:**
```
Session: fuzz-42.session.json
Seed: 1337  Role: Healer  Race: gnome  Moves: 5

Step 0 (startup):
  RNG: 48/312 matched, first divergence at call #49
    #49 expected: rn2(5)=3
    #49 got:      rn2(5)=1
    Context from C log: @ makemon(makemon.c:421)
  Screen: FAIL (RNG cascade means screen can't match)

Step 1 (key='h'):
  RNG: 0/8 matched (cascade from step 0)
  Screen: FAIL
```

This is separate from `fuzz.mjs` so it can be run against any existing session, including the 44 canonical ones.

---

## Phased implementation

### Phase A — Stub generator (1–2 hours)

- Write `scripts/gen-session.mjs`
- Unit-test: generate 5 stubs for different roles, verify JSON structure is valid

### Phase B — Orchestrator (2–3 hours)

- Write `scripts/fuzz.mjs` calling gen → record → score
- Initially just wraps the existing scripts, relies on C binary being pre-built
- Add `--moves 0` as the default so the first runs are chargen+mklev only

### Phase C — Diff tool (1–2 hours)

- Write `scripts/fuzz-diff.mjs`
- Use same RNG normalization logic as `ps_test_runner.mjs`

### Phase D — Iteration workflow (ongoing)

Use the fuzzer to drive implementation work:

1. `node scripts/fuzz.mjs --count 20 --moves 0 --keep-all` — baseline chargen+mklev pass rate
2. Fix whichever C function causes the first divergence (visible from fuzz-diff output)
3. Re-run until `--moves 0` passes 100%
4. Bump to `--moves 5 --move-set move` and repeat

---

## Dependencies & prerequisites

| Dependency | Status | Notes |
|------------|--------|-------|
| C recorder binary | Must build | `bash nethack-c/build-recorder.sh` (needs clang, bison, flex) |
| `record-session.mjs` | Exists | No changes needed |
| `ps_test_runner.mjs` | Exists (frozen) | No changes needed |
| Node ≥ 22 | Required | Already required by project |

---

## Key implementation details

**Randomizing datetimes:** Vary date to exercise moon phase logic. Observed sessions use dates in range 2000–2026. Pick randomly within 1990–2020.

**RNG normalization for diff:** Strip `@ function(file.c:line)` suffix and any leading index prefix. Both sides compared as `rn2(N)=M` etc. This matches what `ps_test_runner.mjs` does.

**Avoiding the fastforward.js trap:** Generated sessions for seeds other than 8000 will fail unless fastforward.js is not used for those seeds. Check that `jsmain.js` only invokes fastforward for seed === 8000 before running the fuzzer at scale.

**Session naming:** Use `fuzz-{seed}-{role}-{moves}moves.session.json` for easy identification, e.g., `fuzz-1337-hea-0moves.session.json`.

**Output directory:** Keep fuzz-generated sessions separate from `sessions/` (which is the canonical set) to avoid polluting the official scorer.
