# seed0060: Shade and the Search for Pain

**Subsystem Focus:** Validates search subroutines, kicking interactions with inanimate objects, and pet AI combat resolution.

This session serves as a rigorous mechanical validation of the engine's physical interaction subroutines. The user entity—an Orcish Rogue named *Shade*—demonstrates the engine's ability to process search attempts, kicks against various targets, and the secondary combat effects of pet entities.

### Frame-by-Frame Execution Highlights

**Steps 1–6: The Kitten's Prowess**
Shade begins his journey on Dungeon Level 1. The engine performs 2,396 PRNG calls to generate his starting state (St:14 Dx:18 Co:12 In:10 Wi:11 Ch:11). Immediately upon starting, Shade's accompanying kitten engages a local newt. 
- The combat resolution for the pet entity is processed across multiple steps.
- Step 5: The kitten successfully kills the newt and, displaying a pragmatic AI, immediately picks up a gold piece. 120 PRNG calls are consumed in this flurry of feline aggression.

**Steps 14–21: Kicking at Nothing**
Shade begins testing the physical interaction subroutines by issuing the kick command (`Ctrl+D`), which prompts *In what direction?* The engine awaits a directional input.
- Step 15: Shade selects downward (`j`). The engine calculates the lack of a target and outputs: *You kick at empty space.* 37 PRNG calls are consumed.
- Steps 16–17: Two wait commands (`.`) advance the turn counter, consuming 51 and 115 PRNG calls respectively as the background simulation churns.
- Steps 18–19: The kick is repeated. Another 40 PRNG calls are consumed to resolve the impact on the air.

**Steps 22–26: The Search Loop**
Shade initiates a rigorous search sequence (`s`). The engine's search subroutine is invoked five times in rapid succession. Each attempt consumes between 28 and 55 PRNG calls as the mathematical engine calculates the probability of detecting hidden doors or traps in the adjacent tiles. Nothing is found, validating the engine's ability to maintain a 'no-find' state across multiple rolls.

**Step 28: The Wall Strikes Back**
Disappointed by the lack of hidden features, Shade decides to kick the wall to his left (`l`). The engine resolves the collision between an orcish foot and a procedurally generated wall.
- 32 PRNG calls resolve the impact.
- The engine calculates the self-damage/pain effect, outputting the classic message: *Ouch! That hurts!*

**Steps 29–40: Final Analytics**
The session concludes with Shade methodically reviewing his inventory, known spells, and attributes. He confirms his Intelligence (10) and Wisdom (11) before performing two final searches and inspecting the floor (`:`), presumably ensuring the wall hasn't moved.

It is a succinct mechanical validation of the engine's physical feedback loops, proving that while searching may be fruitless, kicking a wall will always yield a deterministic result: pain.
