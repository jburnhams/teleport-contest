# seed5006: The Tourist's Self-Inflicted Disaster

**Subsystem Focus:** Validates the mechanical resolution of self-targeted wands of death, the bones-file generation subroutines, and the administrative state-machine for character death.

This session serves as a rigorous mechanical validation of the engine's most terminal state transitions. The user entity—a Tourist named *Wizard*—demonstrates the engine's ability to handle the "Full Moon" luck bonus, administrative wishing for lethal objects, and the subsequent resolution of self-inflicted death and bones-file persistence.

### Frame-by-Frame Execution Highlights

**Step 1: The Full Moon Luck**
The engine performs 4,180 PRNG calls to generate the initial state (St:10 Dx:12 Co:15 In:13 Wi:10). The initialisation logic detects the "Full Moon" condition from the system clock and applies the deterministic luck bonus: *You are lucky! Full moon tonight.*

**Steps 5–38: The Death-Wish**
Wizard immediately invokes administrative powers to jump to Dungeon Level 2 and secure a lethal weapon.
- Step 37: Wizard invokes `#wizwish` and meticulously types: *wand of death*.
- Step 38: 5 PRNG calls resolve the creation of the item: *i - an aluminum wand.*

**Step 41: The Irradiation Event**
Wizard decides to test the wand on himself. He issues the zap command (`z`), selects the wand of death (`i`), and specifies the self-target (`.`).
- The engine's beam-resolution subroutine identifies the player as the target of a death ray.
- The message line confirms the lethal impact: *You irradiate yourself with pure energy!*

**Steps 42–45: Terminal Resolution and Bones**
The ray results in immediate death.
- Step 42: *You die.*
- Step 43: Because the simulation is running in Wizard Mode, the engine provides an administrative prompt to bypass death: *Die? [yn] (n)*.
- Wizard chooses `y`, accepting his fate.
- Step 44: The engine initiates the bones-generation subroutine: *Save bones? [yn] (n)*.
- Wizard selects `y`. 32 PRNG calls resolve the metadata for the bones file.
- Step 45: The engine identifies an existing bones file for this level and prompts for replacement: *Bones file already exists. Replace it? [yn] (n)*.

It is a succinct mechanical validation of the engine's death and persistence infrastructure, proving that it can successfully coordinate complex terminal transitions and external file-system interactions (bones files) with absolute precision. Wizard's self-destruction and the subsequent bones-file negotiation are perfectly synced within the simulation's reality.
