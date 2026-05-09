# seed0383: The Wizard's Hallucinatory Jaunt

**Subsystem Focus:** Validates the "Hallucination" status effect, its impact on entity name rendering, and the persistence of background AI events during sensory distortion.

This session serves as a rigorous mechanical validation of the engine's perception-distortion subroutines. The user entity—a Wizard named *Wizard*—demonstrates the engine's ability to maintain a perfectly deterministic underlying reality while simultaneously rendering a chaotic, randomised overlay of monster names and environmental events.

### Frame-by-Frame Execution Highlights

**Steps 1–3: The Evoker Setup**
The engine performs 2,448 PRNG calls to generate the initial state (St:12 Dx:14 Co:12 In:15 Wi:12). Wizard begins on Dungeon Level 1 and declines the tutorial.

**Steps 4–16: The Teleportation Protocol (`#levelchange`)**
Wizard immediately invokes the administrative command `#levelchange`. This validates the engine's ability to jump directly to specific dungeon depths (reaching Level 8 by Step 198) and apply specific status effects for testing.

**Step 198: The Hallucination State**
Wizard's status line now includes the `Hallu` flag. The engine's rendering logic is now forced to pass every entity name through a randomisation filter.
- Step 202: Wizard observes an entity. The underlying engine knows exactly what it is, but the perception layer renders: *The basement cat wields a short sword!*
- Step 203: Another entity interaction: *The Grey-elf picks up 6 poisoned darts.*
- These steps validate the engine's ability to pull from a randomised pool of "hallucinated" strings without desyncing the underlying PRNG sequence.

**Steps 204–212: Background Entropy**
Even in a state of sensory distortion, the engine continues to resolve global events. At Step 203, a distant sound is processed: *You hear a distant explosion.* This proves that the hallucination overlay does not interfere with the engine's ability to calculate and report independent environmental events.

**Steps 213–218: Final Debug Analytics**
Wizard reviews his attributes, confirming his Intelligence (15) and Wisdom (12). He performs two final searches (`s`) and inspects the floor (`:`). Throughout these final steps, the map continues to refresh with randomised ASCII symbols, a visual representation of his distorted mental state.

It is a flawless mechanical validation of the engine's perception layer, proving that it can successfully maintain a deterministic simulation of "truth" while simultaneously generating a consistent but randomised "lie" for the user interface. The basement cat may have a sword, but the engine knows exactly how many PRNG calls were required to give it to him.
