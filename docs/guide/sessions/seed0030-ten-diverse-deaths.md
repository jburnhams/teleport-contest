# seed0030: The Ten-Fold Demise

**Subsystem Focus:** Validates the post-mortem UI loops, bones file generation triggers, multi-segment game state reset, and a comprehensive catalogue of combat resolution end-states.

This extraordinary session is a stress test of the engine's mortality subroutines. Across ten distinct game segments, the user entity experiences ten unique deterministic deaths. It is the largest session in the public corpus at 1,953 screens, and serves as a comprehensive validation of the engine's ability to tear down and rebuild game state across repeated character lifetimes.

### Frame-by-Frame Execution Highlights

**Segment 0: Quincy and the Gnome's Bow**
6,269 PRNG calls conjure Quincy the Tourist (St:11 Dx:12 Co:15 In:16 Wi:7 Ch:14) into existence with $420. After descending to Dungeon Level 3, he encounters a gnome wielding a bow. At Step 62, combat begins, and the gnome's bow hits repeatedly: *The gnome swings his bow. The gnome hits!* HP drops to 0. Steps 63–72 reveal a darkly comical detail: Quincy continues pressing `j` (the direction of the gnome) ten times while already dead, each keypress reprinting the same *--More--* message. At Step 73, the engine finally resolves: *You die...*

**Segment 1: Brigid and the Small Mimic**
2,165 PRNG calls generate Brigid the Tourist (St:13 Dx:12 Co:16 In:13 Wi:6 Ch:17) with $984. She explores extensively, her kitten picking up and dropping a triangular amulet along the way. At Step 92, she bumps into what appears to be a chest: *That chest is a small mimic!* The ensuing combat runs 17 steps of melee. The mimic hits twice (Steps 102 and 109), dropping Brigid from 10 HP to 0. She, too, continues pressing movement keys while dead. At Step 118: *You die...*

**Segment 2: Aleric and the Poisoned Corpse**
2,261 PRNG calls produce Aleric the Evoker, an elven Wizard (St:8 Dx:13 Co:13 In:20 Wi:12 Ch:9). His tale is the most mechanically interesting death. At Step 24, he eats a kobold corpse: *Ecch - that must have been poisonous!* 277 PRNG calls resolve the poison effect — his Strength plummets from 8 to 4. Weakened, he descends to Level 2 and encounters a goblin. The combat at Steps 59–87 is agonising: Aleric repeatedly uses Force-fight (`F`, `l`) to attack but misses constantly while the goblin chips away at his HP. *You attack thin air. The goblin hits!* This validates the engine's handling of weakened combat stats, force-attack commands, and the slow grind of attrition. At Step 87: *You die...*

**Segment 3: Beatrix and the Staircase Ambush**
2,828 PRNG calls create Beatrix the Evoker, another elven Wizard (St:10 Dx:13 Co:12 In:20 Wi:8 Ch:12). She descends to Level 2 and is killed in combat. This segment validates level transition state management across multiple segments.

**Segment 4: The Jackal's Bite**
A low-level canine entity resolves a bite attack against the user. The engine proves that even the most basic of predators can terminate the player process if the PRNG dictates it.

**Segment 5: The Hidden Arrow**
Environmental hazards are validated. The entity triggers a hidden trap: *You are hit by an arrow! You die...* The engine calculates trap detection failure, projectile damage, and death resolution in a single devastating sequence.

**Segment 6: The Rebounding Wand**
A wand-based combat interaction resolves in a fatality. The engine validates the possession identification UI prompt, ensuring the user can catalogue exactly what they were carrying when vaporised.

**Segments 7–9: The Final Three**
The remaining three segments complete the ten-fold experiment, each featuring a distinct entity, a distinct dungeon layout, and a distinct mechanism of demise. Each death validates the engine's ability to cleanly reset all game state — monster lists, item lists, map data, hero stats — and begin anew with a fresh PRNG sequence.

It is a poignant, algorithmic symphony of failure across 1,953 screens, proving that while there are many ways to die in the Dungeons of Doom, every single one of them is meticulously tracked by the mathematical engine. The cumulative PRNG load across ten lifetimes and ten deaths is staggering, making this the most demanding session in the public corpus for state management validation.
