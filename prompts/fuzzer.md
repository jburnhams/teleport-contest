### ⚠️ PREREQUISITE: C RECORDER
The fuzzer requires the C recorder binary. 
1. **Build**: `bash nethack-c/build-recorder.sh` (requires clang, bison, flex).
2. **Setup**: The binary expects a `sysconf` file in its install directory. If it fails with "Unable to open SYSCF_FILE", ensure `nethack-c/recorder/install/games/lib/nethackdir/sysconf` exists (an empty file is fine).
3. **Binary Location**: `nethack-c/recorder/install/games/lib/nethackdir/nethack`

---

### Iterative Fuzzing Workflow

Your session should follow this tight feedback loop:

1.  **Generate & Run**: Start with a batch of random seeds to find a divergence.
    ```bash
    node scripts/fuzz.mjs --count 10 --moves 0
    ```
2.  **Identify Divergence**: If any fail, run the diff tool on the most interesting one.
    ```bash
    node scripts/fuzz-diff.mjs fuzz-sessions/failing-session.json
    ```
3.  **Investigate & Log**:
    - **Note**: 0/0 RNG or 0/0 screens usually means the C binary got stuck in a menu. Check the `screen` content in the session JSON.
    - **RNG Divergence**: Look at the `#N expected` vs `got` and the **C Context** (file:line).
    - **Update `fuzzer-worklog.md`**: Document the seed, moves, and divergence details.
3.  **Investigate**: 
    - Note the RNG call number where it diverged.
    - Read the **C Context** provided in the diff output (e.g., `@ function(file.c:line)`).
    - Locate that C code in `nethack-c/upstream/src/`.
4.  **Fix**:
    - Port the missing or incorrect logic to the corresponding JS file.
    - Verify the fix by re-running the fuzzer on that **specific session**:
      ```bash
      node scripts/record-session.mjs fuzz-sessions/failing-stub.json
      node frozen/ps_test_runner.mjs fuzz-sessions/failing-session.json
      ```
5.  **Log**:
    - Document the session details, the divergence, and your fix in `fuzzer-worklog.md` (in the `## New Additions` section).
    - If you can't fix it yet, document your findings for future work.
6.  **Progress**: Once `--moves 0` passes reliably, increment to `--moves 1`, then `--moves 5`, etc.

### Rules of Engagement

- **Stay Bit-Exact**: Every RNG call must match C. Do not "fix" RNG by consuming it differently unless that matches C.
- **Maintain Log Integrity**: Update `fuzzer-worklog.md` after every discovered divergence.
- **Durable Learnings**: If you find a structural quirk (e.g., "C checks rect size before reservoir sampling"), add it to `fuzzer-learnings.md` and `learnings.md`.

### Task

Perform one fuzzing iteration now. Start with `--moves 0` if no active worklog entries exist, or continue from the last failing state in `fuzzer-worklog.md`.
