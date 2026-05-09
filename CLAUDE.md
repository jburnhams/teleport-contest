# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working documents

- `plan.md` — ordered implementation roadmap; consult before starting any new work
- `diary.md` — chronological log of work sessions; append an entry after each session
- `learnings.md` — durable insights about the codebase and NetHack behaviour; add entries as discoveries are made

## What this project is

A contest to port NetHack 5.0 from C to JavaScript, bit-exact. Same PRNG sequence, same 24×80 terminal output, frame for frame, byte for byte, against recorded C sessions. The scoring API is in `js/jsmain.js`; the reference C source lives in `nethack-c/upstream/` (git submodule).

## Commands

```bash
# Play the skeleton in the browser (any static server works)
python3 -m http.server 8000

# Score all 44 public sessions locally
bash frozen/score.sh
# or: npm run score

# Score one session
node frozen/ps_test_runner.mjs sessions/seed8000-tourist-starter.session.json

# Set your participant category (agentic | transpiled | other) — required before scoring
bash frozen/set-category.sh agentic

# Build the C recorder (only needed to record new debug sessions)
git submodule update --init nethack-c/upstream
bash nethack-c/build-recorder.sh   # requires clang, make, bison, flex
```

Node ≥22 required. No build step for JS — plain ES6 modules, runnable as-is.

## Architecture

### Scoring contract

The harness calls `runSegment(input, prevGame=null)` from `js/jsmain.js` once per game segment. Input has `{seed, datetime, nethackrc, moves}` — no answer keys. The returned game object must implement:
- `getScreens()` — one serialized 24×80 terminal string per input boundary (per `nhgetch` call)
- `getRngLog()` — every PRNG call in order, formatted as `rn2(N)=M`, `rnd(N)=M`, etc.
- `getCursors()` — `[col, row, visible][]` tiebreaker

Scoring is per-step: each matching screen is one point. PRNG divergence cascades — if RNG call #392 is wrong, every subsequent screen fails.

### Frozen files — do not edit

Three files are overlaid from the canonical copy before every scoring run. Editing them locally only fools local scores:

| File | Purpose |
|---|---|
| `js/isaac64.js` | PRNG engine (ISAAC64). All RNG flows through here. |
| `js/terminal.js` | 24×80 terminal grid + `serialize()`. Defines "the screen." |
| `js/storage.js` | VFS for save/restore, bones, topten. Use `vfsReadFile`/`vfsWriteFile`/`vfsDeleteFile`/`vfsListFiles`. |

### Module dependency graph

```
gstate.js          ← global `game` singleton, no imports
terminal.js        ← ANSI color constants, Terminal class (frozen)
hacklib.js         ← string utilities (leaf)
version.js         ← build version (leaf)
const.js           ← 2000+ constants from NetHack headers
                     imports: terminal.js, hacklib.js, version.js, gstate.js
isaac64.js         ← PRNG engine (frozen)
rng.js             ← PRNG wrappers: rn2, rnd, rn1, rne, rnz, d
                     imports: isaac64.js, gstate.js
options.js         ← parse .nethackrc OPTIONS= lines
game_display.js    ← NetHack-specific terminal wrapper (delegates to Terminal)
jsmain.js          ← NethackGame class + runSegment() contest entry point
nethack.js         ← browser-only bootstrap (calls jsmain.js)
allmain.js         ← newgame(), moveloop_core(), moveloop()
cmd.js             ← rhack() command dispatcher, domove()
display.js         ← newsym, docrt, cls, flush_screen, pline, bot
mklev.js           ← level generation: rooms, corridors, doors, stairs
vision.js          ← vision_recalc, cansee
fastforward.js     ← hardcoded RNG replay for seed8000 only — escape this trap
```

### Key call chain

`runSegment` → `NethackGame.start()` → `newgame()` → `mklev()` → initial display  
Then: `moveloop_core()` per iteration → `rhack()` → `nhgetch()` (triggers screen capture)

The `_preNhgetchHook` in `NethackGame._installCaptureHook()` fires before every key read, capturing the terminal state into `_screens` and the RNG log slice into `_rngSlices`.

### Three PRNG contexts

NetHack uses three independent PRNG contexts — core gameplay, Lua (special levels), display (hallucination). The C recorder logs all three. The JS port must reproduce all three in the correct order. A single off-by-one RNG call cascades through the entire dungeon.

JavaScript evaluates function arguments left-to-right, matching clang (not gcc). This is why the recorder must be built with clang.

### The `fastforward.js` trap

`fastforward.js` contains a hardcoded sequence of `rn2(N)` calls that replays the PRNG for seed8000 only. It never generalizes. The path forward is to delete its entries one at a time, replacing each with a real C function port. Any session other than seed8000 requires the real implementation.

### `gstate.js` — global state

All modules share a single mutable `game` object imported from `gstate.js`. `resetGame()` replaces it with a fresh `{}` at the start of each segment. Key fields: `game.u` (player struct), `game.level` (current level/map), `game.flags`, `game.urole`, `game.urace`, `game.nhDisplay`, `game.moves`, `game.context`.

### Sessions

44 public sessions live in `sessions/*.session.json`. Each is a complete game (or chain) with recorded PRNG calls and terminal frames. `sessions/manifest.json` lists them. Sessions may be multi-segment (save/restore, bones, chained `#quit`) — `prevGame` carries state across segments within a session.

## What to implement

The skeleton implements: basic movement (hjklyubn), partial map rendering, partial level generation (mklev.js), PRNG wrappers, and a hardcoded Tourist chargen for seed8000.

Missing (non-exhaustive): real chargen for all roles/races, o_init (object shuffle), u_init (hero initialization), monster generation and movement, inventory and item commands (`eat`, `drink`, `read`, `zap`, `wear`, `wield`, `drop`, `throw`, `pray`), extended commands (`#loot`, `#enhance`, etc.), shops, special levels, Lua special level support, save/restore, bones, quest levels, multiple dungeon branches.

C reference: `nethack-c/upstream/` — read this, don't compile it (except for recording). Key C files: `allmain.c`, `cmd.c`, `mklev.c`, `display.c`, `rng.c`, `hack.c`, `mon.c`, `o_init.c`, `u_init.c`.

## Scoring details

- Public corpus: 44 sessions, 11,284 steps (max 11,284 points)
- Held-out corpus: 44 sessions, 10,538 steps — never seen locally, scored by the judge every 2 hours
- Score = count of matching 24×80 screens across all sessions
- PRNG match % reported as advisory progress but earns no points directly
- Session timeout: 900 seconds wall-clock per session
- Sandbox: no filesystem writes, no network, no child processes, no native addons

Leaderboard: [mazesofmenace.ai](https://mazesofmenace.ai/leaderboard/) — auto-updates within 2 hours of each push.
