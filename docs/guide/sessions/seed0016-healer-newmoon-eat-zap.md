# seed0016: Healix, Apples, and Self-Induced Slumber

**Subsystem Focus**: Validates environmental datetime flags, object consumption (nutrition), and self-targeted projectile interactions with status effect durations.

This session serves as a rigorous mechanical validation of the engine's status effect subroutines. The user entity—a Gnomish Healer named *Healix*—demonstrates the engine's ability to handle nutrition, the "New Moon" luck penalty, and the precise deterministic duration of self-inflicted sleep.

### Mechanical Sequence

**Steps 1–2: The New Moon**
The engine performs 2,491 PRNG calls to generate the universe and character attributes (St:8 Dx:10 Co:14 In:12 Wi:14 Ch:17). The initialisation logic detects the local system clock and applies a deterministic luck penalty. The message line warns: *Be careful! New moon tonight.*

**Steps 6–7: The Macintosh Validation**
Healix decides to address his starting hunger. He issues the eat command (`e`) and selects an apple (`j`). The engine calculates the nutritional value and any potential effects, outputting a highly specific aesthetic message: *Delicious! Must be a Macintosh!* 7 PRNG calls are consumed as his nutrition level is updated.

**Steps 14–16: The Sleep Ray Experiment**
In a classic display of medical curiosity, Healix selects his *wand of sleep* and zaps it directly at the floor beneath his feet (`z`, `f`, `.`). 
- The engine calculates the beam trajectory and the entity's resistance check. 
- A massive 963 PRNG calls are consumed as the engine resolves the hit and calculates the random duration of the resulting sleep status. 
- The message line updates: *The sleep ray hits you!*

**Steps 17–23: The Dream State**
Healix remains in a deterministic slumber for exactly seven turns. During this phase, the simulation continues to process background AI for his pet kitten. The message line continuously updates with the kitten's activities: *The kitten picks up a gold piece.* 
At Step 23, the sleep counter reaches zero. 67 PRNG calls are consumed as the engine resolves the final monster movements and the wake-up event: *You wake up.*

**Steps 24–35: Post-Slumber Analytics**
Healix immediately checks his inventory, known spells, and discoveries to ensure his mental state is intact. He confirms his Constitution (14) and Intelligence (12) before performing two final searches (`s`) and inspecting the floor (`:`), presumably looking for the gold his kitten was busy collecting while he was napping.

It is a flawless validation of status effect persistence, proving that the engine can successfully maintain and eventually resolve a sleep timer while simultaneously processing the independent AI routines of a pet.
