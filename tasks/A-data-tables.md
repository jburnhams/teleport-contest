# Stream A — Data Tables & Constants

**Can start: NOW** | **Dependencies: None** | **Blocks: D, E, F**

Extract the large data tables from C source into JS. This is pure data work — no game logic, no RNG, no display. Everything else eventually depends on these tables, making this the highest-priority parallel stream.

**Branch:** `feature/stream-a-data-tables`
**Files touched:** `scripts/extract-*.js`, `js/objects.js`, `js/monst.js`, `js/role.js`, `js/const.js` (additions only)

---

## A1. objects[] array
- [x] Read C `include/objects.h` — understand the `OBJECT()` macro and all fields
- [x] Read C `include/objclass.h` — the `objclass` struct definition
- [x] Write `scripts/extract-objects.js` — parse the C headers and generate JS
- [x] Generate `js/objects.js` — full `objects[]` array as JS objects
- [x] Fields needed: `oc_name`, `oc_descr`, `oc_class`, `oc_weight`, `oc_cost`, `oc_material`, `oc_name_known`, `oc_merge`, `oc_uses`, `oc_subtyp`, `oc_prob`, `oc_delay`, `oc_color`, `oc_oprop`, `oc_tough`, `oc_dir`, `oc_hitbon`, `oc_wldam`, `oc_wsdam`, `oc_oc1`, `oc_oc2`, `oc_nutrition`
- [x] Export named constants for key object indices (e.g., `DART`, `FOOD_RATION`, `POT_HEALING`)
- [x] Verify: `objects.length === NUM_OBJECTS` matches C
- [x] Cross-check 5-10 entries by hand against C source

## A2. mons[] array
- [x] Read C `src/monst.c` — understand the `MON()` / `MON3()` macros
- [x] Read C `include/monflag.h` — all M1_, M2_, M3_ flags
- [x] Read C `include/monattk.h` — attack type/damage structs
- [x] Write `scripts/extract-mons.js` — parse C monst.c and generate JS
- [x] Generate `js/monst.js` — full `mons[]` array as JS objects
- [x] Fields needed: `mname`, `mlet` (symbol class), `mlevel`, `mmove`, `ac`, `mr`, `maligntyp`, `geno`, `mattk[]` (attack array), `cwt`, `cnutrit`, `msound`, `msize`, `mresists`, `mconveys`, `mflags1`, `mflags2`, `mflags3`, `mcolor`
- [x] Export named constants for key monster indices (e.g., `PM_NEWT`, `PM_GRID_BUG`, `PM_SHOPKEEPER`)
- [x] Verify: `mons.length === NUMMONS` matches C
- [x] Cross-check 5-10 entries by hand

## A3. Expand role.js — full role/race data tables
- [ ] Port complete `roles[]` array from role.c (13 roles) with ALL fields
- [ ] Include: `name`, `rank` titles (9 levels), `lgod`/`ngod`/`cgod`, `attr` bonuses, `cutoff` levels, `mhrace`, `allow`, `enadv`, `hpadv`, `spelbase`, `spelheal`, `spelshld`, `spelarmr`
- [ ] Port complete `races[]` array (5 races) with all fields
- [ ] Port `align_data[]` — alignment constants
- [ ] Port `genders[]` — gender data
- [ ] Verify bitmask compatibility against learnings.md

## A4. Add missing constants to const.js
- [ ] Object class constants (`WEAPON_CLASS`, `ARMOR_CLASS`, `FOOD_CLASS`, etc.)
- [ ] Monster class constants (symbol letters `S_ANT`, `S_HUMAN`, etc.)
- [ ] Material constants (`METAL`, `WOOD`, `CLOTH`, etc.)
- [ ] Attack type/damage constants (`AT_CLAW`, `AD_PHYS`, etc.)
- [ ] Geno flags (`G_GENOD`, `G_EXTINCT`, `G_NOGEN`, etc.)
- [ ] Any other constants referenced by objects[] or mons[]

---

## Verification

```bash
# After generating objects.js:
node -e "import('./js/objects.js').then(m => console.log('Objects:', m.objects.length))"

# After generating monst.js:
node -e "import('./js/monst.js').then(m => console.log('Monsters:', m.mons.length))"

# No score regression:
npm run score:check
```

## Notes

- The extraction scripts are disposable tooling — they run once to generate the data. But keep them in `scripts/` so we can re-run if we discover errors.
- The generated files should have `// Auto-generated from C source — do not hand-edit` headers, but also be readable JS (not minified).
- Consider generating both the array and a name→index lookup map for convenience.
