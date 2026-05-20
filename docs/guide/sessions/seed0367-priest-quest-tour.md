# seed0367: The Priestess's Quest Tour

**Subsystem Focus**: Validates Wizard Mode administrative navigation (`#levelchange`), role-specific attribute generation for the Priest class, and the bones-level detection subroutines.

This session serves as a rigorous mechanical validation of the engine's debugging infrastructure from the perspective of a chaotic Priestess. The user entity—appropriately named *Wizard*—demonstrates the engine's ability to handle rapid jumps through the dungeon hierarchy while maintaining complex role-specific state.

### Mechanical Sequence

**Steps 1–3: The Aspirant Priestess**
The engine performs 1,846 PRNG calls to generate the initial state for a chaotic human Priestess (St:9 Dx:15 Co:9 In:11 Wi:17 Ch:14). Wizard begins on Dungeon Level 1 and declines the tutorial.

**Steps 4–16: The Teleportation Protocol (`#levelchange`)**
Wizard immediately invokes the administrative command `#levelchange`.
- The engine's debug state-machine activates, processing the command character-by-character.
- This validates the engine's ability to bypass standard navigation restrictions and jump to arbitrary floors.

**Steps 17–301: The Multiverse Leap**
Wizard jumps across multiple levels. By Step 301, she has reached Dungeon Level 12, with 80 Hit Points and an advanced experience level (Xp:20, status "Canoness").
- The engine flawlessly resolves the generation of the twelfth floor and all associated entity spawns.
- The message line confirms the successful transition: *You materialize on a different level!*

**Steps 304–308: The Rapid Return**
Wizard continues her diagnostic tour, initiating another level-teleport.
- Step 308: A massive **7,422 PRNG calls** resolve a jump to Dungeon Level 3.
- The engine successfully handles the transition without losing track of the entity's high Wisdom (17).

**Steps 309–323: Final Debug Analytics**
The session concludes with Wizard reviewing her inventory, known spells, and attributes.
- Step 309: She attempts to move a boulder: *You try to move the boulder, but in vain.*
- Step 319: The engine's diagnostic attributes are checked: *You haven't encountered any bones levels.*
- This validates the engine's ability to track global state flags (like bones-level encounters) across administrative jumps.

It is a flawless mechanical validation of the engine's administrative infrastructure, proving that it can successfully coordinate rapid-fire level generation and complex role-specific state management with absolute precision. The Wizard's tour demonstrates the engine's robust handling of even the most unconventional navigational patterns.
