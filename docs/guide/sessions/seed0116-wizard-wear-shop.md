# seed0116: The Wizard's Wardrobe

**Subsystem Focus:** Validates Wizard Mode administrative commands, rapid multi-level teleportation, and the `wear` (`W`) equipment-state subroutines.

This session serves as a rigorous mechanical validation of the engine's debugging and equipment-state logic. The user entity—a human Wizard named *Wizard*—utilises administrative powers to jump between dungeon levels and test the robust handling of armor and equipment flags.

### Frame-by-Frame Execution Highlights

**Steps 1–6: The Wizard Mode Setup**
The engine performs 2,968 PRNG calls to generate the initial state (St:12 Dx:10 Co:11 In:18 Wi:13 Ch:9). Wizard begins on Dungeon Level 1 and, after a brief moment of indecision, declines the tutorial.

**Steps 8–10: The Level 2 Leap**
Wizard invokes an administrative level-teleport.
- At Step 10, the engine resolves the transition to Dungeon Level 2.
- 2,538 PRNG calls are consumed as the new floor is procedurally generated.
- The message line confirms the shift: *You materialize on a different level!*

**Step 14: The Wear Subroutine**
Wizard initiates the `wear` (`W`) command.
- The engine's equipment-state machine transitions to the armor selection sub-state.
- This validates the engine's ability to filter the inventory for wearable items and handle the resulting UI paginations.

**Steps 109–114: The Multiverse Tour**
Wizard continues his diagnostic tour of the dungeon levels.
- Step 109: A massive 2,976 PRNG calls resolve a jump to Dungeon Level 10.
- Step 114: Unsatisfied with the lower depths, Wizard jumps back to Level 2. 
- 3,043 PRNG calls are consumed to re-generate (or re-materialise) the second floor.

**Steps 115–126: Final Analytics**
The session concludes with Wizard methodically reviewing his inventory, known spells, discoveries, and attributes. He confirms his high Intelligence (18) and Wisdom (13) before performing two final searches (`s`) and inspecting the floor (`:`).

It is a succinct mechanical validation of the engine's diagnostic infrastructure, proving that it can successfully handle rapid, high-entropy transitions between levels while simultaneously managing the complex state transitions of the equipment and inventory systems. The Wizard's wardrobe is perfectly synced, even across the multiverse.
