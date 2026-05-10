# seed0360: The Wizard Mode World Tour

**Subsystem Focus:** Validates Wizard Mode administrative navigation (`#levelchange`), mass-level generation, and the physical interaction subroutines for heavy object displacement.

This session is a comprehensive mechanical stress test of the engine's debugging and level-generation infrastructure. The user entity—a Wizard named *Wizard*—demonstrates the engine's ability to handle rapid, non-linear jumps through the dungeon hierarchy while maintaining perfect state synchronisation and resolving complex physical interactions with boulders.

### Mechanical Sequence

**Steps 1–4: The Evoker Setup**
The engine performs 2,896 PRNG calls to generate the initial state (St:9 Dx:13 Co:16 In:18 Wi:10 Ch:9). Wizard begins on Dungeon Level 1 and declines the tutorial.

**Steps 5–16: The Teleportation Protocol (`#levelchange`)**
Wizard immediately invokes the administrative command `#levelchange`.
- The engine transitions to the level-selection sub-state.
- This validates the engine's ability to jump to arbitrary dungeon coordinates without using standard staircases or portals.

**Steps 17–809: The Tour**
For over 800 steps, Wizard jumps across multiple dungeon levels. The engine tirelessly generates new floors, resolves monster spawns, and maintains the entity's increasingly powerful state. By Step 822, Wizard has reached Level 20, with 136 Hit Points and a Strength of 25 (presumably via administrative intervention).

**Steps 810–818: The Boulder Challenge**
Wizard encounters a boulder and attempts to displace it (`b, n, b, h`).
- Step 810: The engine's physical interaction subroutine calculates the displacement probability. Despite his Strength of 25, the first attempt fails: *You try to move the boulder, but in vain.*
- Step 815: After several attempts, the engine resolves a success. 43 PRNG calls resolve the movement: *With great effort you move the boulder.*
- This validates the engine's ability to handle heavy-object displacement and the resulting map updates.

**Steps 821–832: Final Debug Analytics**
The session concludes with Wizard reviewing his inventory, known spells, and attributes. He confirms his "debug mode" status and his peak Intelligence (18). He performs two final searches (`s`) and inspects the floor (`:`), ensuring the universe is still deterministic.

It is a flawless mechanical validation of the engine's administrative infrastructure, proving that it can successfully coordinate rapid-fire level generation, massive attribute shifts, and complex physics-based environmental interactions with absolute precision. The Wizard's world tour is a testament to the engine's stability in even the most unrealistic of scenarios.
