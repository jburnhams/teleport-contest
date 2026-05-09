# AGENTS.md

Concise reference for AI agents working in this repository. See and update diary.md, learnings.md and plan.md as you go

## What this is

A contest to port NetHack 5.0 from C to JavaScript, **bit-exact**. The JS implementation must reproduce the same PRNG sequence and the same 24×80 terminal output as recorded C sessions — frame for frame, byte for byte.

- **44 public sessions** in `sessions/` — used for local scoring
- **44 held-out sessions** — scored by the judge every 2 hours on push to `main`
- **Score** = total matching 24×80 screens across all sessions (max 11,284 public / 10,538 held-out)
- Current baseline: **15 screens matched** (seed8000 only)

## Entry point

`js/jsmain.js` — `runSegment(input, prevGame=null)` is the contest entry point. The harness calls it once per game segment. Returned game object must implement `getScreens()`, `getRngLog()`, `getCursors()`.

## Do not touch

Three files are overlaid from `frozen/` before every scoring run — editing them only fools local scores:

| File | Role |
|---|---|
| `js/isaac64.js` | PRNG engine |
| `js/terminal.js` | 24×80 terminal grid + `serialize()` |
| `js/storage.js` | VFS for save/restore/bones |

The pre-commit hook and CI both enforce this. `frozen/` files are also hash-checked against `.teleport/frozen-hashes.json`.

## Branching Policy

**Never work directly in `main`.** Always create a feature branch (`feature/...`, `fix/...`) for your work, commit there, and open a Pull Request against `main`. This ensures the CI score gates run properly before code merges.

## Score gates (CI)

Every PR against `main` must pass **CI – Score Gate** (`.github/workflows/ci.yml`):

1. SHA256-verifies all `frozen/` files against `.teleport/frozen-hashes.json` — fails if tampered
2. Rejects any PR where `scores/baseline.json` was manually edited
3. Runs all 44 sessions and compares total `screensMatched` against `scores/baseline.json`
4. **Fails if score regressed** (new score < baseline)

On merge to `main`, the **Score + Promote Baseline** workflow re-scores and automatically bumps `scores/baseline.json` if the score improved, committing back via the `BASELINE_PAT` secret.

**`scores/baseline.json` must never be edited by hand** — it is owned by the CI action.

### Local check

```bash
npm run score:check   # runs scorer then compares against baseline; exits 1 on regression
npm run score         # scorer only, human-readable output to stderr
```

## Implementation order

PRNG divergence cascades — one wrong RNG call breaks every subsequent screen. Fix in this order:

1. **Chargen RNG** (`role.c` → `js/chargen.js`) — `pick_role/race/gend/align` before `o_init`
2. **`o_init`** (`o_init.c`) — object shuffle, ~193 RNG calls, constant across seeds
3. **Dungeon init** — `init_dungeons()` RNG block
4. **`u_init`** — hero stats and starting inventory
5. **Monster init** — `makemon`, `newmonst`
6. **Per-step RNG** — replace `fastforward_step()` with real `movemon`/`regen`/`gethungry`
7. **Screen rendering** — status line (`bot`), map (`docrt`/`newsym`), messages (`pline`)
8. **Command dispatch** — movement, inventory, extended commands

See `plan.md` for the full ordered roadmap. See `learnings.md` for hard-won codebase insights.

## C reference

`nethack-c/upstream/` — read only (do not compile except for debug recording).  
Key files: `allmain.c`, `cmd.c`, `mklev.c`, `display.c`, `rng.c`, `o_init.c`, `u_init.c`, `role.c`.

## Key pitfall

`fastforward.js` contains a hardcoded RNG replay for seed8000 only. It never generalises. Replace its entries one at a time with real C function ports — never extend it.
