# seed5002: The Mimic's Fatal Surprise

**Subsystem Focus:** Validates the "Full Moon" luck bonus, administrative wishing for elemental wands, and the deterministic resolution of a fatal mimic encounter.

This session serves as a rigorous mechanical validation of the engine's environmental-luck and combat-death subroutines. The user entity—a Wizard named *Wizard*—demonstrates the engine's ability to process temporal luck modifiers and complex entity-combat interactions, culminating in a terminal state transition.

### Mechanical Sequence

**Step 1: The Full Moon Luck**
The engine performs 2,717 PRNG calls to generate the initial state (St:11 Dx:13 Co:16 In:15 Wi:9). The initialisation logic detects the "Full Moon" condition from the system clock and applies the deterministic luck bonus: *You are lucky! Full moon tonight.*

**Steps 2–18: The Administrative Arsenal**
Wizard immediately invokes administrative powers to jump to Dungeon Level 5 and secure a powerful weapon.
- Step 4: 3,093 PRNG calls resolve the generation of the fifth floor.
- Step 5: Wizard invokes `#wizwish` and meticulously types: *wand of fire*.
- This validates the engine's ability to handle administrative object creation and multi-level generation in rapid succession.

**Steps 156–182: The Mimic Dance**
Wizard encounters a "small mimic" entity.
- The session validates the engine's ability to handle rapid, interrupted commands (`m, s, y`).
- Step 182: The engine resolves a movement for the mimic. 19 PRNG calls are consumed.

**Steps 190–192: The Terminal Transition**
The small mimic engages Wizard in melee.
- Step 190: 18 PRNG calls resolve a successful hit: *The small mimic hits!* Wizard's HP drops to 4.
- Step 191: 12 PRNG calls resolve the final fatal blow: *The small mimic hits!* 
- Step 192: Wizard's hit points reach zero, triggering the death state machine: *You die...*

It is a succinct mechanical validation of the engine's combat and state-transition logic, proving that even with the luck of a full moon and a wand of fire, the deterministic reality of a mimic's attack can lead to a terminal result. The Wizard's overconfidence and the mimic's accuracy are perfectly synced within the simulation.
