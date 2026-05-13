# seed5002: The Wizard's Arsenal Catastrophe

**Subsystem Focus**: Validates the `#wizwish` administrative wishing, multi-wand zapping, bolt-bounce physics, and the deterministic resolution of self-inflicted elemental damage.

This session is a comprehensive stress test of the engine's object-creation, wand-zapping, and damage-resolution subroutines. Across two segments, a Wizard named *wizard* (St:11 Dx:13 Co:16 In:15 Wi:9 Ch:11) systematically wishes for an arsenal of elemental wands, then discovers that bouncing bolts and exploding potions are far more dangerous to the caster than to any monster.

### Mechanical Sequence

**Segment 0: Full Moon and Five Wishes**

**Step 0–1:** The engine initialises the universe. The "Full Moon" condition is detected: *You are lucky! Full moon tonight.*

**Steps 2–4: Teleport to DL5**
Wizard invokes `Ctrl-V` to teleport to dungeon level 5. 3,093 PRNG calls generate the new level.

**Steps 5–74: The Wishing Spree**
Wizard invokes `#wizwish` (Ctrl-W) five times, requesting:
- *wand of fire* (step 18: "an aluminum wand")
- *wand of cold* (step 32: "a pine wand")
- *wand of lightning* (step 51: "a copper wand")
- *wand of magic missile* (step 74: "a tin wand")
- (A fifth wish for *wand of death* is typed across steps 98–112 but gets buffered during the chaos that follows)

**Step 75–85: Monster Creation**
Wizard invokes `Ctrl-G` to create a *gas spore* next to themselves.

**Steps 86–120: The Self-Inflicted Inferno**
Wizard begins zapping wands in rapid succession — fire, cold, lightning, magic missile — each bolt bouncing off walls and striking the caster. The engine resolves each bolt trajectory, bounce angle, and damage calculation. Potions of invisibility and oil in inventory ignite and explode. After cascading damage across 35 steps, the engine reaches the terminal state at step 120: *You die...*

**Segment 1: The Second Attempt**
A new wizard arrives and repeats a similar pattern — administrative wishes, exploration, and eventual death at step 132. This segment validates that the full wishing-and-combat pipeline remains deterministically reproducible across fresh game instances with a different PRNG state.

It is a vivid demonstration that the engine's bolt-physics and item-interaction subroutines are perfectly synchronised, even when the player's strategy is to point every available destructive force at themselves.
