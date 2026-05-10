# seed0200: Kira and the Forbidden Feast

**Subsystem Focus:** Validates Monk-specific vegetarianism constraints, nutritional status changes, and the ethical-penalty subroutines.

This session serves as a rigorous mechanical validation of the engine's role-based ethical constraints. The user entity—a human Monk named *Kira*—demonstrates the engine's ability to calculate nutritional state changes while simultaneously applying the psychological and luck penalties associated with violating a monastic vow of vegetarianism.

### Mechanical Sequence

**Steps 1–3: The Candidate Kira**
The engine performs 3,245 PRNG calls to generate the universe and Kira's starting state (St:14 Dx:16 Co:13 In:8 Wi:15 Ch:9). Kira begins on Dungeon Level 1, armed with her bare hands and a monastic discipline, and declines the tutorial.

**Steps 8–13: The Canine Coordination**
Kira explores the initial corridors, testing the basic locomotion and entity-swapping subroutines. At Step 8, she successfully swaps places with her pet dog, validating the engine's ability to manage overlapping mobile entities.

**Steps 20–24: The Ethical Violation**
Kira encounters a goblin corpse (`%`). In a display of profound spiritual weakness, she issues the pickup command (`,`) and then the eat command (`e`), selecting the goblin corpse (`k`).
- The engine's nutrition subroutine activates.
- It identifies the player as a Monk and the food item as "meat".
- A massive 169 PRNG calls resolve the nutritional gain and the resulting ethical penalties.
- Step 23: The message line reflects her internal conflict: *You feel guilty. This goblin corpse tastes terrible!*
- Step 24: 27 PRNG calls resolve the final state change: *You finish eating the goblin corpse.*

**Steps 27–39: The Analytical Penance**
Having compromised her spiritual standing, Kira spends the remainder of the session methodically reviewing her attributes and inventory. She confirms her Wisdom (15) and Intelligence (8) before performing two final searches (`s`) and inspecting the floor (`:`), presumably contemplating her dietary choices.

It is a flawless mechanical validation of the engine's ethical-constraint logic, proving that the state machine can successfully track and penalise role-specific behaviours like meat-eating with absolute deterministic precision. Kira may be full, but her conscience (and the engine's luck counter) has taken a significant hit.
