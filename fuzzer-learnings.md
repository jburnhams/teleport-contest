## Fuzzer / Session Generator Tasks

* The fuzzer tools are fully implemented:
    * `scripts/gen-session.mjs` generates session stubs with randomized inputs (roles, datetimes, moves).
    * `scripts/fuzz.mjs` orchestrates the pipeline (stub generation -> C recording -> JS scoring) and can be run at scale.
    * `scripts/fuzz-diff.mjs` diffs generated JSON against C recordings, providing precise RNG divergence logs.
* We identified that the C recorder requires building (needs `clang`, `bison`, `flex`) via `bash nethack-c/build-recorder.sh`. Ensure the binary is present at `nethack-c/recorder/install/games/lib/nethackdir/nethack`.
* When generating tests, use `--moves 0` initially to isolate chargen and `mklev` logic before adding move sets.
* `fuzz-diff.mjs` uses `normalizeRng()` to strip formatting before comparing strings to ensure exact matching and prevent regex flakiness.
* **Important:** `fastforward` calls in `js/allmain.js` must be explicitly isolated for `seed === 8000` only!
    * Otherwise, dynamically seeded generated sessions will pull in `seed=8000` mock data which guarantees RNG desync during `mklev`.
    * We modified `allmain.js` and `jsmain.js` to correctly skip `fastforward` logic for all random `--seed` generations.
* Baseline Pass Rate for `chargen+mklev` (0 moves):
    * As of early fuzzing, 0/20 random `--moves 0` tests pass.
    * The most frequent RNG divergence points are found in:
        * `makelevel` (14 occurrences across 44 canonical sessions)
        * `lspo_map` (6 occurrences)
        * `fill_special_room` (6 occurrences)
        * `mkobj` (3 occurrences)
        * `mkclass_aligned` (2 occurrences)
* These divergence locations represent the highest priority porting candidates to improve baseline test pass rates.
