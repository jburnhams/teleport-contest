
# Fuzzer Learnings

1. The `fuzz-diff.mjs` tool is incredibly valuable for finding exactly where the RNG diverges between C and JS implementations.
2. There's a slight discrepancy in PRNG matching if we look at the raw steps; `fuzz-diff.mjs` accounts for this by filtering to only `rn2`, `rnd`, `rne`, `rnz`, `rn1`, `d`, `rnl` calls, just like `ps_test_runner.mjs`.
3. We noticed that `makelevel` and `lspo_map` are frequent culprits for initial divergence during level generation, meaning they should be high-priority candidates for porting.
4. Currently, the generated 0-move, 5-move, and 20-move fuzzer sessions pass perfectly, but this is primarily because these sessions don't trigger the specific edge cases causing failures in the canonical 44 sessions, or because the fast-forwarding mechanic successfully bypasses the divergence.
5. To diff screens precisely, the normalizer must use the same `screensVisuallyEqual` function from `ps_test_runner.mjs` if we want strict output, though for `fuzz-diff.mjs` we mostly care if the PRNG has cascaded.
