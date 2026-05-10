# Fuzzer Learnings

1. The `fuzz-diff.mjs` tool is incredibly valuable for finding exactly where the RNG diverges between C and JS implementations.
2. There's a slight discrepancy in PRNG matching if we look at the raw steps; `fuzz-diff.mjs` accounts for this by filtering to only `rn2`, `rnd`, `rne`, `rnz`, `rn1`, `d`, `rnl` calls, just like `ps_test_runner.mjs`.
3. We noticed that `makelevel` and `lspo_map` are frequent culprits for initial divergence during level generation, meaning they should be high-priority candidates for porting.
4. **Setup**: The C recorder binary requires a `sysconf` file in its installation directory to run correctly. An empty file is sufficient to bypass the "Unable to open SYSCF_FILE" error.
5. **Chargen Prompts**: If the `nethackrc` contains contradictory options (e.g., `role:Valkyrie, gender:male`), the C binary will fall back to an interactive menu, causing an immediate divergence and `0/0 RNG` reports. `gen-session.mjs` must be kept in sync with NetHack's role compatibility rules.
6. **RNG Reporting**: If a session reports `0/0 RNG`, it's a strong indicator that the game failed to start properly or is stuck in an early menu.
7. **Bit-Exactness**: The `fuzz-diff.mjs` tool is the most reliable way to trace divergences back to the specific C source line (e.g., `mklev.c:990`).
8. **Display Parity**: `gen-session.mjs` now uses full alignment names (`lawful`, `neutral`, `chaotic`) to ensure the C binary recognizes them reliably.
