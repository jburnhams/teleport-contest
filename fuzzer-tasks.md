# Fuzzer Implementation Tasks

Granular checklist for building the session generator / differential tester.
See `fuzzer-plan.md` for design rationale and architecture overview.

Tick items with `[x]` as they are completed.

---

## Phase 0 — Prerequisites

- [x] **0.1** Verify C recorder binary exists at `nethack-c/recorder/install/games/lib/nethackdir/nethack`
  - If missing: `bash nethack-c/build-recorder.sh` (needs clang, bison, flex)
- [x] **0.2** Confirm Node ≥ 22: `node --version`
- [x] **0.3** Add `fuzz-sessions/` to `.gitignore` (generated sessions should not be committed)
- [x] **0.4** Smoke-test the existing pipeline end-to-end:
  ```bash
  node scripts/record-session.mjs sessions/seed0016-healer-newmoon-eat-zap.session.json /tmp/rerecord-test.json
  node frozen/ps_test_runner.mjs /tmp/rerecord-test.json
  ```
  Both should succeed without errors before continuing.

---

## Phase A — `scripts/gen-session.mjs` (stub generator)

### A.1 Scaffold

- [x] **A.1.1** Create `scripts/gen-session.mjs` with shebang `#!/usr/bin/env node` and ES module imports
- [x] **A.1.2** Add usage/help text printable with `--help`

### A.2 Role/race/align compatibility table

- [x] **A.2.1** Define `ROLES` array — each entry: `{ key, name, races[], aligns[] }`:
  ```
  arc  Archeologist  [hum,dwa]        [neu,law]
  bar  Barbarian     [hum,orc]        [neu,cha]
  cav  Caveman       [hum,dwa,gno]    [neu,law]
  hea  Healer        [hum,gno]        [neu]
  kni  Knight        [hum]            [law]
  mon  Monk          [hum]            [neu,law,cha]
  pri  Priest        [hum,elf]        [neu,law,cha]
  ran  Ranger        [hum,elf,gno,orc][neu,cha]
  rog  Rogue         [hum,orc]        [cha]
  sam  Samurai       [hum]            [law]
  tou  Tourist       [hum]            [neu]
  val  Valkyrie      [hum,dwa]        [neu,cha]
  wiz  Wizard        [hum,elf,gno,orc][neu,cha]
  ```
- [x] **A.2.2** Add `RACE_NAMES` map: `{ hum:'human', elf:'elf', dwa:'dwarf', gno:'gnome', orc:'orc' }`
- [x] **A.2.3** Add `pickRandomCombo()` — returns `{ role, race, gender, align }` with valid combination

### A.3 CLI argument parsing

- [x] **A.3.1** Parse `--seed N` (integer; default: `Math.floor(Math.random() * 9999) + 1`)
- [x] **A.3.2** Parse `--moves N` (integer ≥ 0; default: 0)
- [x] **A.3.3** Parse `--move-set move|explore|all` (default: `move`)
  - `move`:    chars from `hjklyubn`
  - `explore`: `move` + `. s`
  - `all`:     `explore` + `i,@`
- [x] **A.3.4** Parse `--role ROLE` (validate against ROLES keys; default: random)
- [x] **A.3.5** Parse `--race RACE` (validate compatible with chosen role; default: random)
- [x] **A.3.6** Parse `--gender male|female` (default: random)
- [x] **A.3.7** Parse `--align law|neu|cha` (validate compatible with chosen role; default: random)
- [x] **A.3.8** Parse `--datetime YYYYMMDDHHMMSS` (validate 14-digit string; default: random)
- [x] **A.3.9** Parse `--out FILE` (default: write to stdout)
- [x] **A.3.10** Exit with clear error message if an invalid/incompatible combination is given explicitly

### A.4 Random datetime generator

- [x] **A.4.1** Implement `randomDatetime()` — returns a string like `YYYYMMDDHHMMSS`
  - Year range: 1990–2020 (exercises moon phases and calendar variation)
  - Month: 01–12, day valid for month, hour 00–23, min/sec 00
  - Output format: zero-padded 14-char string

### A.5 Move sequence generator

- [x] **A.5.1** Implement `randomMoves(count, moveSet)` — returns a string of `count` characters
  - Each character picked independently at random from the move set chars
  - For 0 moves return `''`

### A.6 nethackrc builder

- [x] **A.6.1** Implement `buildNethackrc({ role, race, gender, align })` — returns the rc string:
  ```
  OPTIONS=name:Fuzz,role:<roleName>,race:<raceName>,gender:<gender>,align:<align>
  OPTIONS=!autopickup,!tutorial
  OPTIONS=suppress_alert:3.4.3
  OPTIONS=symset:DECgraphics
  OPTIONS=disclose:yi ya yv yg yc yo
  ```
  Use full role/race names (e.g. `Healer`, `gnome`) matching canonical session format.

### A.7 Output

- [x] **A.7.1** Assemble v5 session stub object:
  ```json
  { "version": 5, "segments": [{ "seed", "datetime", "nethackrc", "moves" }] }
  ```
  No `steps` key.
- [x] **A.7.2** Write JSON to `--out FILE` or stdout with `JSON.stringify(..., null, 2)` (no trailing newline issues)
- [x] **A.7.3** Print summary to stderr (never stdout): `seed=N role=X/race/align moves=M`

### A.8 Tests / validation

- [x] **A.8.1** Run `node scripts/gen-session.mjs` (zero args) — outputs valid JSON, parses with `JSON.parse`
- [x] **A.8.2** Generate one stub per role (13 stubs), verify all parse cleanly
- [x] **A.8.3** Run `node scripts/gen-session.mjs --moves 5 --move-set explore` — verify `moves` field has length 5 and only expected chars
- [x] **A.8.4** Verify `record-session.mjs` accepts a generated stub without error:
  ```bash
  node scripts/gen-session.mjs --seed 42 --role hea --out /tmp/stub.json
  node scripts/record-session.mjs /tmp/stub.json /tmp/recorded.json
  ```
  `recorded.json` should contain `steps` array.

---

## Phase B — `scripts/fuzz.mjs` (orchestrator)

### B.1 Scaffold

- [x] **B.1.1** Create `scripts/fuzz.mjs` with shebang and imports: `node:child_process`, `node:fs/promises`, `node:path`, `node:url`
- [x] **B.1.2** Resolve paths to project root, `scripts/gen-session.mjs`, `scripts/record-session.mjs`, `frozen/ps_test_runner.mjs`
- [x] **B.1.3** Check C binary exists at startup; if not, print path and exit with clear error

### B.2 CLI argument parsing

- [x] **B.2.1** Parse `--count N` (default: 10)
- [x] **B.2.2** Parse `--moves N` (default: 0)
- [x] **B.2.3** Parse `--move-set TYPE` (default: `move`; passed through to gen-session)
- [x] **B.2.4** Parse `--role ROLE` (optional; passed through to gen-session for all sessions)
- [x] **B.2.5** Parse `--output-dir DIR` (default: `fuzz-sessions/`)
- [x] **B.2.6** Parse `--keep-all` flag (default: false — only keep failing sessions)
- [x] **B.2.7** Parse `--verbose` flag (default: false — show detailed RNG diff on failure)
- [x] **B.2.8** Parse `--seed-start N` (default: random; if given, use N, N+1, N+2… as seeds)

### B.3 Per-session pipeline

- [x] **B.3.1** Create output dir if it does not exist
- [x] **B.3.2** For each session i of N:
  - Determine seed (sequential from `--seed-start` or independent random)
  - Build gen-session args from CLI options
- [x] **B.3.3** Invoke gen-session as subprocess → write stub to `<output-dir>/fuzz-<seed>-stub.json`
  - Capture stderr for the summary line (seed/role/race)
  - On failure: print error, skip this session
- [x] **B.3.4** Invoke record-session as subprocess with stub → `<output-dir>/fuzz-<seed>-<role>-<moves>moves.session.json`
  - Pipe stderr to our stderr in real time so the user can see recording progress
  - On failure: print error, skip scoring this session
- [x] **B.3.5** Invoke ps_test_runner in `--worker-session=<file>` mode as subprocess
  - Parse `__RESULT_ONE__\n{json}` from stdout
  - On parse failure or non-zero exit: treat as failed session with error message

### B.4 Result parsing and inline diff

- [x] **B.4.1** Extract from result JSON: `passed`, `metrics.rngCalls.{matched,total}`, `metrics.screens.{matched,total}`, `error`
- [x] **B.4.2** If not `--keep-all` and session passed: delete the recorded session file (keep only failures)
- [ ] **B.4.3** Implement `findFirstRngDivergence(sessionPath, jsRngLog)`:
  - Load recorded session JSON
  - Flatten all `step.rng` arrays into one C rng list
  - Apply same normalization as ps_test_runner: `entry.replace(/\s*@\s.*$/, '').replace(/^\d+\s+/, '').trim()`
  - Find first index where `normalize(c[i]) !== normalize(js[i])`
  - *Note: findFirstRngDivergence is skipped. Relies on fuzz-diff execution instead.*
  - Return `{ index, expected: c[i], got: js[i] }` (keep raw C entry for the `@ location` annotation)
- [ ] **B.4.4** On failure with `--verbose`: call `findFirstRngDivergence`, print divergence detail
  - *Note: Currently relying on fuzz-diff instead.*

### B.5 Progress output

- [x] **B.5.1** Print progress line per session (to stderr):
  ```
  [2/10] seed=0042 Wiz/elf/cha 0 moves ... PASS (312/312 RNG, 1/1 screens)
  [3/10] seed=1337 Hea/gnome/neu 0 moves ... FAIL (47/312 RNG, 0/1 screens)
    RNG diverged at call #48: expected rn2(5)=3 [makemon.c:421], got rn2(5)=1
  ```
- [x] **B.5.2** Print final summary:
  ```
  Summary: 7/10 passed
  Failing sessions saved to: fuzz-sessions/
  ```
- [x] **B.5.3** Exit with code 0 if all passed, code 1 if any failed

### B.6 Tests / validation

- [ ] **B.6.1** Run `node scripts/fuzz.mjs --count 3 --moves 0 --keep-all` — produces 3 recorded sessions and a summary
- [ ] **B.6.2** Verify recorded session files are valid JSON with `steps` arrays
- [ ] **B.6.3** Run with `--verbose` on a failing session and verify divergence line appears

---

## Phase C — `scripts/fuzz-diff.mjs` (standalone diff tool)

### C.1 Scaffold

- [x] **C.1.1** Create `scripts/fuzz-diff.mjs`; accept one positional arg: path to a recorded session JSON
- [x] **C.1.2** Print usage and exit if no arg given

### C.2 Run JS against the session

- [x] **C.2.1** Invoke `node frozen/ps_test_runner.mjs --worker-session=<path>` as subprocess
- [x] **C.2.2** Parse `__RESULT_ONE__` JSON from stdout
- [x] **C.2.3** On subprocess error or timeout: print error and exit

### C.3 Load C reference data

- [x] **C.3.1** Load + parse the session JSON file
- [x] **C.3.2** Call `normalizeSession()` from `frozen/session_loader.mjs` to handle any legacy format
- [x] **C.3.3** Flatten per-step RNG arrays per segment into `{ segIdx, stepIdx, key, rng[], screen }` records

### C.4 Per-step diff output
*Note: Implementation fails on exact matching (e.g., rn2(2)=0 vs rn2(2)=0 due to regex bugs). Needs fixing.*

- [ ] **C.4.1** Print session header: filename, seed, role, race, moves count (parse from nethackrc)
- [ ] **C.4.2** For each step across all segments:
  - Apply normalization to both C and JS rng arrays
  - Find index of first divergence (or report "all matched")
  - Print step header: `Step N (key='h'):` or `Step 0 (startup):`
  - Print RNG summary: `RNG: M/T matched` — if diverged, show call index + expected vs got
  - Print the raw C annotation (the `@ function(file.c:line)` part) alongside the expected value
  - Print screen result: `Screen: PASS` or `Screen: FAIL`
  - If a step is a cascade (all 0 RNG matched following an earlier failure): note `(cascade)`
- [ ] **C.4.3** Print overall totals at end

### C.5 Tests / validation

- [ ] **C.5.1** Run against one of the 44 canonical sessions that currently fails:
  ```bash
  node scripts/fuzz-diff.mjs sessions/seed0016-healer-newmoon-eat-zap.session.json
  ```
  Should show first divergence with C source location.
- [ ] **C.5.2** Run against a passing session — should print all steps as `PASS`
- [ ] **C.5.3** Verify output is useful: the `@ location` annotation points to a real C file in `nethack-c/upstream/`

---

## Phase D — Integration and baseline

### D.1 Verify fastforward.js isolation

- [x] **D.1.1** Confirm in `js/jsmain.js` that fastforward functions are only called when `seed === 8000`
  - If not isolated: fix the guard before running the fuzzer (non-8000 seeds will produce wrong results otherwise)

### D.2 Establish baselines

- [ ] **D.2.1** Run `fuzz-diff` against all 44 canonical sessions, collect first-divergence locations:
  ```bash
  for f in sessions/*.session.json; do node scripts/fuzz-diff.mjs "$f" 2>&1 | head -20; done
  ```
- [ ] **D.2.2** Tally which C functions appear most often as the first divergence point — this is the priority list for porting
- [ ] **D.2.3** Run `node scripts/fuzz.mjs --count 20 --moves 0 --keep-all --seed-start 100` — record pass rate for chargen+mklev only
- [ ] **D.2.4** Document the baseline pass rate in `diary.md`

### D.3 Ongoing workflow

- [ ] **D.3.1** After fixing a C function port, run `--moves 0` fuzzer across 20 seeds to confirm improvement
- [ ] **D.3.2** When `--moves 0` reaches 100%, run `--moves 5 --move-set move` across 20 seeds
- [ ] **D.3.3** When `--moves 5` reaches 100%, run `--moves 20 --move-set explore`

---

## Reference: key file paths

| File | Role |
|------|------|
| `scripts/gen-session.mjs` | **Create** — stub generator |
| `scripts/fuzz.mjs` | **Create** — orchestrator |
| `scripts/fuzz-diff.mjs` | **Create** — standalone diff tool |
| `scripts/record-session.mjs` | Existing — drives C binary, do not modify |
| `frozen/ps_test_runner.mjs` | Frozen — scoring/comparison, do not modify |
| `frozen/session_loader.mjs` | Frozen — session normalizer, import but do not modify |
| `nethack-c/recorder/install/games/lib/nethackdir/nethack` | C binary (must be built) |
| `fuzz-sessions/` | Generated output dir (gitignored) |

## Reference: RNG normalization (copy from ps_test_runner.mjs)

```javascript
function normalizeRng(entry) {
    return entry.replace(/\s*@\s.*$/, '').replace(/^\d+\s+/, '').trim();
}
function isRngCall(s) {
    return /^(rn2|rnd|rne|rnz|rn1|d|rnl)\(/.test(normalizeRng(s));
}
```

Use these exact functions in `fuzz-diff.mjs` to guarantee comparison parity with the judge.
