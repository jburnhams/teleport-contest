# seed0101: Ricky's Readiness Error

**Subsystem Focus:** Validates the `quiver` (`Q`) and `travel` (`_`) subroutines, as well as the mechanical distinction between readying a weapon and wielding it.

This session serves as a rigorous mechanical validation of the engine's equipment-state logic. The user entity—a human Ranger named *Ricky*—demonstrates the engine's ability to handle the subtle distinction between "quivering" a projectile-launcher and actually "wielding" it, leading to a predictably suboptimal combat result.

### Frame-by-Frame Execution Highlights

**Steps 1–3: The Tenderfoot**
The engine performs 2,291 PRNG calls to generate the universe and Ricky's attributes (St:15 Dx:11 Co:15 In:13 Wi:14 Ch:7). Ricky begins her journey on Dungeon Level 1, declining the tutorial.

**Steps 4–6: The Quiver Trap**
Ricky attempts to prepare for combat by issuing the quiver command (`Q`). She selects her bow (`b`).
- The engine recognises that the bow is currently in her 'alternate weapon' slot.
- It prompts: *That is your alternate weapon. Ready it instead?*
- Ricky confirms with `y`.
- The engine correctly updates the 'ready' state for the bow. 

**Step 9: The Tactical Oversight**
Ricky decides to fire an arrow. She issues the throw command (`t`) and selects an arrow (`d`). However, she has only *readied* the bow, not *wielded* it.
- The engine calculates the interaction.
- 9 PRNG calls resolve the trajectory.
- The message line politely points out the mechanical error: *You aren't wielding a bow, so you throw your arrow by hand.*

**Steps 10–16: Navigational Complexity**
Ricky attempts to use the travel command (`_`).
- The engine initiates the travel-destination selector.
- The user process navigates the menu with `ESC`, attempting to select a map location.
- Step 15: The engine processes an invalid navigational input (`i`), resulting in: *Unknown direction: 'i' (use 'h', 'j', 'k', 'l' or '.').*

**Steps 17–26: Final Analytics**
Ricky methodically reviews her inventory, known spells, discoveries, and attributes. She confirms her Intelligence (13) and Wisdom (14) before performing two final searches (`s`) and inspecting the floor (`:`), identifying the staircase up.

It is a succinct mechanical validation of the engine's equipment-state matrix, proving that the engine can successfully maintain the complex state of a "readied but not wielded" bow while simultaneously managing failed navigational attempts. Ricky may have thrown her arrow by hand, but the engine resolved the trajectory with absolute deterministic precision.
