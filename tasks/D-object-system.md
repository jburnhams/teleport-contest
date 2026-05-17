# Stream D — Object System

**Can start: After A** | **Dependencies: A (objects[] array)** | **Blocks: B4+, F**

Port the object creation and management system. Objects are items in the game — weapons, armor, potions, scrolls, food, gold, etc. Every level has objects placed during mklev, and the hero starts with an inventory.

**Branch:** `feature/stream-d-object-system`
**Files touched:** `js/mkobj.js` (new), `js/invent.js` (new), `js/objnam.js` (new), `js/decl.js` (new)

---

## D1. Object struct and linked list
- [x] Read C `include/obj.h` — the `obj` struct definition
- [x] Define JS object shape: `{ otyp, oclass, ox, oy, quan, owt, spe, oeroded, cursed, blessed, known, dknown, bknown, ... }`
- [x] Port `newobj()` — allocate a new object
- [x] Port object linked list management: `fobj` (floor objects), `invent` (hero inventory)
- [x] Port `place_object()` / `remove_object()` — put object on/off map
- [x] Port `obj_extract_self()` — remove from any chain

## D2. mkobj — object creation
- [ ] Read C `src/mkobj.c` — understand the full `mksobj()` function
- [x] D2.1: Port BUC assignment (`bcsign`, `curse`, `bless`, `blessorcurse`, `uncurse`)
- [x] D2.2: Port Probability helpers (`rnd_class`)
- [x] D2.3: Port Erosion & Quantity helpers (`may_generate_eroded`, `mkobj_erosions`, `is_multigen`)
- [ ] D2.4: Port Monster & Corpse helpers (`rndmonnum`, `rndmonnum_adj`, `undead_to_corpse`, `set_tin_variety`, `can_be_hatched`, `dead_species`)
- [ ] D2.5: Port `mksobj_init` (class-specific initialisation, enchantment, charges)
- [ ] D2.6: Port `mksobj` core (create object by type index)
- [ ] D2.7: Port `mkobj` and probability tables (create random object of a class)
- [ ] D2.8: Port `mkobj_at` and `mkobjcnt`

## D3. Gold handling
- [x] Port `mkgold()` — create gold objects
- [ ] Port `goldobj_to_gobj()` — gold amount calculation
- [x] Port `findgold()` — count gold in inventory

## D4. Object naming (partial — enough for display)
- [ ] Read C `src/objnam.c` — understand `xname()`, `doname()`, `an()`, `the()`
- [ ] Port `obj_descr(otyp)` — get description string for an object type
- [ ] Port `xname(obj)` — basic object name (e.g., "a rusty +1 long sword")
- [ ] Port `doname(obj)` — full object name with quantity
- [ ] Port articles: `an()`, `the()`, `The()`
- [ ] Port plural: `makeplural()`
- [ ] This is needed for message display ("You see a potion of healing here")

## D5. Inventory management
- [ ] Read C `src/invent.c` — understand inventory letter assignment
- [ ] Port `addinv()` — add object to hero's inventory
- [ ] Port `freeinv()` — remove from inventory
- [ ] Port `merged()` — merge stackable objects
- [ ] Port inventory letter assignment (a-zA-Z, `$` for gold)
- [ ] Port `getobj()` — prompt "What do you want to [verb]?" and select from inventory
- [ ] Port `display_inventory()` — show inventory list as a menu

---

## Verification

```bash
# Unit-test object creation:
node -e "
  import { objects } from './js/objects.js';
  import { mksobj } from './js/mkobj.js';
  // Test creating a few known objects
  const dart = mksobj(/* DART index */);
  console.log('Dart:', dart);
"

# No score regression:
npm run score:check
```

## Notes

- D2 is the most RNG-critical part — `mksobj` calls rn2/rnd for enchantment, quantity, BUC
- The exact sequence of RNG calls in `mksobj` must match C precisely
- Start with D1 (struct) + D2 (mkobj) — these are needed by mklev fill (Stream B4)
- D4 (naming) and D5 (inventory) can be deferred until commands need them
- `objects[]` from Stream A must land first
