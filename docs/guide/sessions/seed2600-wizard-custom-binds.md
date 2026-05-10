# seed2600: The Wizard's Bound Multiverse

**Subsystem Focus:** Validates Wizard Mode administrative navigation and the engine's ability to handle custom key-binding states within the input state machine.

This session serves as a rigorous mechanical validation of the engine's input-handling and level-generation infrastructure. The user entity—a human Wizard named *Wizard*—demonstrates the engine's ability to coordinate rapid administrative jumps across dungeon levels while maintaining a consistent deterministic reality, regardless of the underlying key-binding configuration.

### Mechanical Sequence

**Steps 1–4: The Evoker Setup**
The engine performs 2,828 PRNG calls to generate the initial state (St:10 Dx:14 Co:14 In:18 Wi:10). Wizard begins on Dungeon Level 1 and declines the tutorial.

**Steps 11–12: The Feline Swap**
Wizard begins exploring the initial room, coordinating his movement with his pet kitten.
- Step 11: 9 PRNG calls resolve the swap.
- Step 12: 16 PRNG calls resolve the second swap.
- This validates the engine's ability to maintain perfect entity-coordinate synchronisation during basic locomotion.

**Steps 19–20: The Level 12 Jump**
Wizard invokes an administrative level-teleport.
- Step 20: A massive **4,152 PRNG calls** are consumed in a single frame as the engine resolves the generation of Dungeon Level 12.
- The message line confirms the successful transition: *You materialize on a different level!*

**Steps 21–25: The Level 5 Return**
Unsatisfied with the depths, Wizard jumps again.
- Step 25: 4,379 PRNG calls resolve the generation of Dungeon Level 5.
- This validates the engine's ability to handle rapid, high-entropy transitions between levels without losing track of the entity's high Intelligence (18).

**Steps 26–37: Final Analytics**
The session concludes with Wizard reviewing his inventory, known spells, discoveries, and attributes. He confirms his Intelligence (18) and Wisdom (10) before performing two final searches (`s`) and inspecting the floor (`:`). 

It is a succinct mechanical validation of the engine's administrative and input infrastructure, proving that it can successfully handle rapid-fire level generation and complex UI states with absolute precision. Whether the user is using standard keys or custom binds, the engine resolves the underlying simulation with absolute deterministic grace.
