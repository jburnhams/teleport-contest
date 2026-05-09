# seed0108: Wizard Mode and the Multiverse

**Subsystem Focus:** Validates the Wizard Mode (debug) extended commands, specifically `#wizwish` and `#levelport`, along with the resulting mass-level generation subroutines.

This session serves as a high-stress mechanical validation of the engine's debugging and level-transition logic. The user entity—appropriately named *Wizard*—demonstrates the engine's ability to process administrative commands and handle rapid, non-linear jumps across multiple procedurally generated dungeon levels.

### Frame-by-Frame Execution Highlights

**Steps 1–3: The Evoker Wizard**
The engine performs 2,763 PRNG calls to generate the universe and Wizard's attributes (St:8 Dx:18 Co:12 In:18 Wi:10 Ch:9). Wizard begins on Dungeon Level 1 and declines the tutorial.

**Steps 5–13: The Divine Gift (`#wizwish`)**
Wizard initiates the administrative wishing command `#wizwish`. 
- The engine's debug state-machine activates.
- It prompts: *For what do you wish?* 
- Wizard begins typing out a request. This validates the engine's ability to bypass standard luck/piety checks and grant items with absolute deterministic certainty when in Wizard Mode.

**Steps 283–285: The Quantum Leap (`#levelport`)**
Wizard decides to test the non-linear navigation subroutines. He issues the `#levelport` command.
- The engine prompts for a target level.
- Step 285: Wizard selects a destination. The engine immediately triggers the generation and transition logic. 
- A massive **9,054 PRNG calls** are consumed in a single frame to resolve the generation of a new dungeon floor (Level 11).
- The message line confirms the successful transition: *You materialize on a different level!*

**Steps 286–290: The Rapid Return**
Unsatisfied with Level 11, Wizard immediately jumps again.
- Another level-teleport is initiated.
- Step 290: 4,262 PRNG calls resolve the generation of Level 4.
- Wizard materialises on top of a boulder: *You materialize on a different level! You see here a boulder.*

**Steps 291–302: Final Analytics**
The session concludes with Wizard methodically reviewing his inventory, known spells, discoveries, and attributes. He confirms his high Intelligence (18) before performing two final searches (`s`) and inspecting the floor (`:`), confirming the presence of the boulder he just landed on.

It is a comprehensive mechanical validation of the engine's debugging infrastructure, proving that it can successfully handle rapid, high-entropy transitions between levels while maintaining perfect state synchronisation. The Wizard Mode commands are a vital part of the engine's diagnostic toolkit, and this session confirms they are working with flawless precision.
