1. **Author Update Script**: Use `run_in_bash_session` to author a temporary Node script (e.g., `cat << 'EOF' > update_mkobj.cjs`) that injects the required imports and functions (`is_damageable`, `is_flammable`, `is_rustprone`, `is_crackable`, `is_rottable`, `is_corrodeable`, `erosion_matters`, `may_generate_eroded`, `mkobj_erosions`, `is_multigen`) into `js/mkobj.js`.
2. **Execute Update Script**: Run the update script with `node update_mkobj.cjs` to apply the modifications to `js/mkobj.js`.
3. **Verify additions**: Run `git diff js/mkobj.js` to verify the code injections were successful.
4. **Clean up**: Remove the temporary script using `rm update_mkobj.cjs`.
5. **Author test file**: Use `run_in_bash_session` to author the test file with `cat << 'EOF' > test/mkobj.erosions.test.js` containing tests for `is_multigen` and `mkobj_erosions`.
6. **Verify additions**: Run `git status` to verify the file creation was successful.
7. **Run tests**: Run `npx vitest run && npm run score:check` to verify the implementation and ensure no regressions.
8. **Pre-commit step**: Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
9. **Submit changes**: Execute `git add js/mkobj.js test/mkobj.erosions.test.js`, run `git commit -m 'feat(stream-D): port erosion and quantity helpers'`, and call the `submit` tool.
