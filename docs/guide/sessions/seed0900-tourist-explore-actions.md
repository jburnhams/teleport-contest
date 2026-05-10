# seed0900: Touristo's Non-Scoring Adventure

**Subsystem Focus:** Validates "Explore Mode" status, the command-count prefix logic, and the resolution of long-duration pet combat.

This session serves as a rigorous mechanical validation of the engine's administrative and combat-automation subroutines. The user entity—a Tourist named *Touristo*—demonstrates the engine's ability to handle the "non-scoring explore mode" flag, the queuing of repeated commands via count prefixes, and the deterministic resolution of a multi-turn melee between a pet and a monster.

### Mechanical Sequence

**Steps 1–3: The Explore Mode**
The engine performs 2,471 PRNG calls to generate the universe and Touristo's attributes (St:13 Dx:10 Co:12 In:12 Wi:11). Immediately upon starting, the engine applies the administrative status flag: *You are in non-scoring explore/discovery mode.* This validates the engine's ability to bypass standard scoring logic while maintaining the integrity of the simulation.

**Steps 6–7: The Inedible Selection**
Touristo decides to eat (`e`). He selects an item from his inventory (`a`).
- The engine's nutrition subroutine identifies the object as non-food.
- The message line correctly rejects the request: *You cannot eat that!*

**Steps 10–13: The Count Prefix (`20s`)**
Touristo demonstrates the engine's command-queuing infrastructure.
- Step 11: He inputs the number `2`.
- Step 12: He inputs the number `0`. The message line reflects the accumulator: *Count: 20*.
- Step 13: He issues the search command (`s`).
- The engine prepares to execute 20 search cycles. However, the simulation is immediately interrupted by a nearby combat event.

**Steps 13–73: The Jackal Melee**
For 60 steps, Touristo stands by as his little dog engages a jackal.
- The message line continuously updates with the results of the melee: *The little dog misses the jackal. The little dog bites the jackal.*
- This phase validates the engine's ability to handle background AI combat resolution while the player's queued commands are either being executed or suppressed.
- Step 73: 354 PRNG calls are consumed as the engine resolves the final fatal blow: *The jackal is killed!*

**Steps 74–83: Final Analytics**
Touristo reviews his known spells, discoveries, and attributes. He confirms his Intelligence (12) and Wisdom (11) before performing two final searches (`s`) and inspecting the floor (`:`), identifying a doorway.

It is a succinct mechanical validation of the engine's command-accumulator and background combat-resolution logic, proving that it can successfully coordinate queued player actions with independent AI entities over dozens of turns with absolute deterministic precision. Touristo may not be scoring points, but his pet is certainly earning its keep.
