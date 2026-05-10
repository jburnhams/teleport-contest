# seed0030: The Ten-Fold Demise

**Subsystem Focus**: Validates the post-mortem UI loops, bones file generation triggers, multi-segment game state reset, and a comprehensive catalogue of combat resolution end-states.

This extraordinary session is a stress test of the engine's mortality subroutines. Across ten distinct game segments, the user entity experiences a mixture of exploration and deterministic deaths. It is a comprehensive validation of the post-mortem UI state machine and input handling, ensuring that the engine maintains perfect synchronisation across multi-segment sessions.

### Mechanical Sequence

**Segment 0: The Healer's Stroll**
Quincy the Healer begins her journey with 2,443 PRNG calls to generate the universe. She explores the dungeon level, wandering corridors with standard movement keys. The segment concludes without combat — the engine validates basic multi-step locomotion and the "Unknown command" response for spurious space-key inputs.

**Segment 1: Brigid and the Small Mimic**
2,165 PRNG calls generate Brigid the Tourist (St:13 Dx:12 Co:16 In:13 Wi:6 Ch:17) with $984. She explores extensively, her kitten picking up and dropping a triangular amulet along the way. At Step 92, she bumps into what appears to be a chest: *That chest is a small mimic!* The ensuing combat runs 17 steps of melee. The mimic hits twice (Steps 102 and 109), dropping Brigid from 10 HP to 0. She, too, continues pressing movement keys while dead. At Step 118, 1 PRNG call resolves the final state: *You die...*

**Segment 2: Aleric and the Poisoned Corpse**
2,261 PRNG calls produce Aleric the Evoker, an elven Wizard (St:8 Dx:13 Co:13 In:20 Wi:12 Ch:9). His tale is the most mechanically interesting death. At Step 24, he eats a kobold corpse: *Ecch - that must have been poisonous!* 277 PRNG calls resolve the poison effect — his Strength plummets from 8 to 4. Weakened, he descends to Level 2 and encounters a goblin. The combat at Steps 59–87 is agonising: Aleric repeatedly uses Force-fight (`F`, `l`) to attack but misses constantly while the goblin chips away at his HP. *You attack thin air. The goblin hits!* This validates the engine's handling of weakened combat stats, force-attack commands, and the slow grind of attrition. At Step 87, 1 PRNG call resolves the final state: *You die...*

**Segment 3: Beatrix and the Staircase Ambush**
2,828 PRNG calls create Beatrix the Evoker, another elven Wizard (St:10 Dx:13 Co:12 In:20 Wi:8 Ch:12). She descends to Level 2 and is killed in combat. This segment validates level transition state management across multiple segments.

**Segment 4: The Jackal's Bite**
A low-level canine entity resolves a bite attack against the user. The engine proves that even the most basic of predators can terminate the player process if the PRNG dictates it.

**Segment 5: The Hidden Arrow**
Environmental hazards are validated. The entity explores extensively over 236 steps, testing trap detection and interaction subroutines.

**Segment 6: The Rebounding Wand**
At Step 244, a wand-based combat interaction resolves in a fatality. The engine again validates the "possession identification" UI prompt, ensuring the user can see exactly what they were carrying when they were vaporised.

**Segment 7: Swidnica's Theft**
At Step 162, a combat death at the hands of Swidnica. The engine validates the item-theft-upon-death pathway: *You die... Swidnica takes all your possessions.*

**Segments 8–9: Statistical Finality**
The final two segments complete the experiment with extended exploration runs, each testing the engine's state-persistence validation across segment boundaries. The transition between segments proves that cross-session state (bones, save files) is maintained correctly.

It is a poignant, algorithmic symphony of failure across 1,953 screens, proving that while there are many ways to die in the Dungeons of Doom, every single one of them is meticulously tracked by the mathematical engine. The cumulative PRNG load across ten lifetimes and ten deaths is staggering, making this the most demanding session in the public corpus for state management validation.
