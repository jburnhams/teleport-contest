# seed0361: The Archeologist's Debug Tour

**Subsystem Focus**: Validates Wizard Mode administrative navigation (`#levelchange`), role-specific attribute generation, and the mass-level generation subroutines for the Archeologist class.

This session serves as a rigorous mechanical validation of the engine's debugging infrastructure from the perspective of an Archeologist. The user entity—appropriately named *Wizard*—demonstrates the engine's ability to handle rapid jumps through the dungeon hierarchy while maintaining role-specific state.

### Mechanical Sequence

**Steps 1–3: The Digger Setup**
The engine performs 2,922 PRNG calls to generate the initial state for a neutral human Archeologist (St:10 Dx:11 Co:11 In:15 Wi:18 Ch:10). Wizard begins on Dungeon Level 1 and declines the tutorial.

**Steps 4–16: The Teleportation Protocol (`#levelchange`)**
Wizard immediately invokes the administrative command `#levelchange`.
- The engine transitions to the level-selection sub-state.
- This validates the engine's ability to process administrative navigation commands character-by-character.

**Steps 17–346: The Archeological Survey**
Wizard jumps across multiple levels. By Step 347, he has reached Dungeon Level 10, with 94 Hit Points and a significant increase in experience (Xp:20). 
- A massive **6,811 PRNG calls** are consumed in a single frame to resolve the generation of the tenth floor.
- The message line confirms the successful transition: *You materialize on a different level!*

**Steps 348–352: The Rapid Relocation**
Wizard continues his diagnostic tour, initiating another level-teleport.
- Step 352: 71 PRNG calls resolve a jump to Dungeon Level 4.
- The engine's state-machine successfully handles the transition without losing track of the entity's high Wisdom (18).

**Steps 353–365: Final Debug Analytics**
The session concludes with Wizard reviewing his inventory, known spells, and attributes. He confirms his "debug mode" status and his peak Wisdom (18). He performs two final searches (`s`) and inspects the floor (`:`), ensuring the Archeologist's reality remains deterministic.

It is a flawless mechanical validation of the engine's administrative infrastructure, proving that it can successfully coordinate rapid-fire level generation and complex role-specific attribute management with absolute precision. The Wizard's tour continues to demonstrate the engine's stability across different classes.
