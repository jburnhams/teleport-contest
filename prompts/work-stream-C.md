You are working on the Teleport Contest — a competition to port NetHack 5.0 from C to JavaScript, bit-exact. Every PRNG call must match C's in order; one off-by-one call cascades and fails all subsequent screen comparisons. Scoring is 1 point per matching 24×80 terminal screen across 44 public sessions (11,284 steps total).

**Your job this session:** Make small, steady progress on **Stream C** from `tasks/C-display.md`. Work one sub-task at a time, verifying after each before moving on.

---

### Before you start

Read these files in order — do not skip any:

1. `tasks/C-display.md` — your task checklist for this stream
2. `plan.md` — architecture overview and phase priorities
3. `tasks.md` — dependency graph across all streams (check nothing you touch blocks an already-running stream)
4. `learnings.md` — durable discoveries; read all of it before touching any code
5. `diary.md` — recent session log; skim the last 2-3 entries for context

Do git submodule update --init 

this repo includes a patched build of NetHack
5.0 that introduces two new environment variables you can pin:
- **`NETHACK_SEED`** — seeds the PRNG. Same seed → same dungeon, same monsters, same loot.
- **`NETHACK_FIXED_DATETIME`** — sets the date and time of play
 (format `YYYYMMDDHHMMSS`). NetHack uses the wall clock for moon phase, hire dates, shopkeeper greetings, and the Friday-the-13th luck penalty; pinning the datetime makes all of these reproducible.


Then read the specific C reference files listed in your task file before writing any JS.



---

### Workflow — one sub-task at a time

For each checklist item in `tasks/C-display.md`:

1. **Read the C source** listed in the task (`nethack-c/upstream/src/` or `nethack-c/upstream/include/`). Understand the exact logic before writing JS.
2. **Port to JS** — same function names, same parameter order, same branching logic as C. Add `// C ref: filename.c` at the top of each new file.
3. **Write a vitest test** before or alongside the implementation. Tests live in `test/` (create the directory if it doesn't exist). Name files `test/{module}.test.js`. Tests must:
   - Be runnable with `npx vitest run`
   - Verify exact behaviour against known C values from `learnings.md` or session RNG logs in `sessions/*.session.json`
   - Never mock the PRNG — import and use the real `rng.js` with a known seed
4. **Run the scorer** — `npm run score:check` — must not regress. If it does, fix before proceeding.
5. **Tick the checklist** — edit `tasks/C-display.md` and mark the item `[x]`.
6. **Commit** — one commit per sub-task, message format: feat(stream-C): <what was done>

Only move to the next checklist item after the scorer passes.

---

### Updating docs

After completing each sub-task or making a discovery:

- **`learnings.md`** — append any non-obvious finding: exact RNG call counts, C quirks, ordering constraints, bitmask values. Write it so a future session can skip re-discovering it.
- **`diary.md`** — at session end, append an entry under today's date (`## YYYY-MM-DD`). List: what was done, what was found, what's next.

Do **not** update `plan.md` — that is the high-level roadmap, not a log.

---

### Verification commands

```bash
# Run all tests
npx vitest run

# Score one session (fast check of a specific RNG path)
node frozen/ps_test_runner.mjs sessions/<session>.session.json

# Full score check — must not regress
npm run score:check

```

To compare your JS output against the C RNG log, look at a session's `rngLog` field:

```bash
node -e "
const s = JSON.parse(require('fs').readFileSync('sessions/seed0360-wizard-world-tour.session.json'));
s.segments[0].rngLog.slice(0,30).forEach((l,i)=>console.log(i,l));
"
```

---

### Rules

- **No regressions.** `npm run score:check` must pass after every commit.
- **Stay faithful to C.** Same function names, same control flow. Don't invent abstractions.
- **No comments explaining what code does** — only add a comment if the WHY is non-obvious (a C quirk, a hidden ordering constraint, a workaround).
- **Do not touch frozen files**: `js/isaac64.js`, `js/terminal.js`, `js/storage.js`.
- **Do not touch `fastforward.js`** except to delete lines you've replaced with real implementations.
- Each stream touches different files — do not edit files owned by another stream (see `tasks.md` dependency graph).
- If you discover a bug outside your stream's scope, document it in `learnings.md` and open a note in `diary.md` — do not fix it inline.

---

### Stream-specific context

Read `tasks/C-display.md` now and identify:
- Which sub-tasks are already marked `[x]` — skip those
- Which sub-tasks have explicit dependencies — confirm those dependencies are on `main` before starting
- The verification steps at the bottom of the task file — run them after each sub-task

---

### Ending the session

When you stop (by choice or context limit):

1. Run `npm run score:check` one final time.
2. Update `diary.md` with what was done and what's next.
3. Commit any uncommitted changes (with `npm run score:check` passing).
4. Do **not** open a PR — wait for explicit instruction.

If you hit a blocker (dependency not on `main`, unclear C behaviour, test failing you can't diagnose), stop at that sub-task, document the blocker in `diary.md`, and move to the next independent sub-task if one exists.
