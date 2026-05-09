# Stream F — Hero Init & Game Loop

**Can start: After A + D** | **Dependencies: A (role tables), D (mkobj for ini_inv)** | **Blocks: B5**

Port hero initialization — stats, starting inventory, skills, attributes. This is what makes the hero correct for any role/seed, replacing the hardcoded Tourist state in `allmain.js`.

**Branch:** `feature/stream-f-hero-init`
**Files touched:** `js/u_init.js` (new), `js/attrib.js` (new), `js/exper.js` (new)

---

## F1. u_init — hero initialization
- [ ] Read C `src/u_init.c` — full `u_init()` function
- [ ] Port `u_init()` — main hero setup: race/role/gender/alignment applied to `game.u`
- [ ] Port role-specific stat distributions (`init_attr()` from attrib.c)
- [ ] Port skill initialization (`skill_init()` from weapon.c)
- [ ] Port alignment record initialization
- [ ] Port initial HP/energy calculation
- [ ] Port `adjabil()` — racial attribute adjustments

## F2. ini_inv — starting inventory (DEPENDS ON: D2)
- [ ] Port `ini_inv()` from u_init.c — create all starting items
- [ ] Port the 13 role-specific inventory tables (trobj arrays)
- [ ] Use `mksobj()` from Stream D for item creation
- [ ] Handle quantity, BUC status, enchantment per role
- [ ] Port `knows_object()` — mark items as identified
- [ ] Port `uwep`, `uarm`, `uarmh` etc. — equip starting items

## F3. newpw — energy calculation (generalized)
- [ ] Port `newpw()` from exper.c — works for all roles, not just Wizard
- [ ] Based on `role.enadv` and `race.enadv` tables
- [ ] Called at ulevel==0 during init

## F4. Attribute system
- [ ] Port `init_attr()` from attrib.c — base + racial + role attributes
- [ ] Port `adjattrib()` — modify an attribute
- [ ] Port `acurr()` — current attribute (base + modifiers)
- [ ] Port strength 18/xx handling

## F5. Experience system
- [ ] Port `newuexp()` — XP thresholds per level
- [ ] Port `check_experience()` — level up/down
- [ ] Port `adjabil()` — intrinsics gained at specific levels

---

## Notes
- F1 + F2 are the core — they replace the hardcoded hero state in allmain.js
- F2 needs mkobj from Stream D — this is the key dependency
- F3 generalizes the current Wizard-only `rnd(3)` call in allmain.js
- Once F lands and B5 wires it in, `fastforward_post_mklev()` can be deleted
