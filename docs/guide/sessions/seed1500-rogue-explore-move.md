# seed1500: Robin and the Reluctant Kitten

**Subsystem Focus:** Validates pet pathfinding over corpses, trap-trigger resolution for non-player entities, and the boundary checks for the `apply` command.

This session serves as a rigorous mechanical validation of the engine's background entity AI and environmental interaction subroutines. The user entity—a human Rogue named *Robin*—demonstrates the engine's ability to coordinate complex pet behaviours, including dietary reluctance and independent trap evasion.

### Mechanical Sequence

**Steps 1–3: The Footpad Robin**
The engine performs 2,284 PRNG calls to generate the initial state (St:11 Dx:18 Co:11 In:12 Wi:11). Robin begins on Dungeon Level 1, accompanied by his loyal kitten.

**Steps 13–20: Feline Hesitation**
Robin observes his kitten navigating the corridor. 
- Step 13: The kitten encounters an orc corpse (`%`). 
- The engine's pet AI identifies the corpse as a non-preferred food item for a kitten.
- The message line reflects this deterministic hesitation: *Your kitten steps reluctantly onto an orc corpse.*
- For seven consecutive steps, the message persists as the kitten navigates the overlapping entities.

**Steps 21–22: The Kitten and the Trap**
The background simulation resolves a trap interaction for the kitten.
- Step 21: The kitten triggers a dart trap. 24 PRNG calls resolve the evasion check: *The kitten is almost hit by a dart!*
- Step 22: Displaying a pragmatic AI, the kitten immediately interacts with the fired projectile: *The kitten picks up a dart.*
- This phase validates the engine's ability to process trap triggers and item interactions for independent AI entities with absolute deterministic precision.

**Steps 25–27: The Misplaced Pick**
Robin attempts to apply his lock pick (e) to a wall or doorway to his right (l).
- Step 27: The engine's tool-application subroutine performs a logical check and determines that no door entity exists at those coordinates.
- 61 PRNG calls resolve the interaction: *You see no door there.*

**Steps 28–39: Final Analytics**
Robin methodically reviews his inventory, known spells, discoveries, and attributes. He confirms his Intelligence (12) and Wisdom (11) before performing two final searches (`s`) and inspecting the floor (`:`).

It is a succinct mechanical validation of the engine's pet-AI and trap-resolution logic, proving that the simulation is alive with independent activity even when the player is merely walking down a hallway. Robin may have missed the door, but his kitten didn't miss the dart.
