# seed4500: The Knight's Quest for Coverage

**Subsystem Focus:** Validates the `#jump` extended command, the "New Moon" luck penalty, and the generation of Quest-specific branches like the Knight's "Home" levels.

This session serves as a comprehensive mechanical coverage test of the engine's movement and branching subroutines. The user entity—a Knight named *Wizard*—demonstrates the engine's ability to handle complex navigational commands like jumping, while also validating the procedural generation of class-specific Quest branches.

### Mechanical Sequence

**Steps 1–2: The New Moon Penalty**
The engine performs 2,776 PRNG calls to generate the initial state (St:18/01 Dx:9 Co:12 In:7 Wi:14). The initialisation logic detects the "New Moon" condition from the system clock and applies the deterministic luck penalty: *Be careful! New moon tonight.*

**Steps 3–16: The Leap of Faith (`#jump`)**
Wizard immediately tests the Knight's mobility by invoking the `#jump` extended command. 
- The engine transitions to the directional/map selection state.
- This validates the engine's ability to coordinate jumping-trajectory calculations and the associated UI prompts for destination selection.

**Steps 17–1798: The Long Road Home**
For nearly 1,800 steps, Wizard explores the dungeon and its various branches. The engine proves its stability by maintaining deterministic synchronisation across a long-duration session.
- Step 1794: Wizard survives a lethal encounter: *You survived that attempt on your life.*
- Step 1795: An administrative level-teleport is used to reach the Knight's Quest branch.

**Steps 1799–1800: The Quest Entrance**
Wizard arrives at the entrance to his Quest.
- Step 1799: 630 PRNG calls resolve the generation of a unique quest entrance: *As you exit the swamps, you see before you a huge, gaping hole...*
- Step 1800: The transition to "Home Level 5" is confirmed. Environmental status effects from previous levels are cleared: *The heat and smoke are gone.*
- The status line reflects the new location: `Home 5`.

**Steps 1801–1813: Final Quest Analytics**
The session concludes with Wizard reviewing his inventory and attributes within the Quest branch. He confirms his Intelligence (7) and Wisdom (14). He attempts to search, but the engine detects a nearby monster, validating the persistent search-suppression logic.

It is a flawless mechanical validation of the engine's branching and mobility infrastructure, proving that it can successfully coordinate complex Quest generation, multi-tile movement (jumping), and long-duration state persistence with absolute precision. The Knight's home levels are perfectly generated, byte for byte.
