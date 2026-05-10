# seed0012: The Vault Escort

**Subsystem Focus:** Validates complex character generation navigation and the specialized Vault Guard AI escort subroutine.

This session serves as a rigorous mechanical test of the game's vault security logic. The user entity—a Monk named *Dodeco*—successfully triggers the highly specific AI behaviour of a Croesus vault guard, demonstrating the engine's ability to calculate pathfinding for an escort sequence.

### Frame-by-Frame Execution Highlights

**Steps 1–16: Navigating the Void**
Dodeco opts for complete manual character creation. Rather than accepting the defaults, the user process rapidly cycles through the UI selection trees, pressing `[`, `l`, `"`, `m`, `/`, and `h` to meticulously specify their exact role, creed, race, and gender. The UI state machine correctly handles this flurry of input. Upon pressing `y` to confirm, the mathematical engine awakens, generating the dungeon with a massive 3,066 PRNG call sequence.

**Steps 17–293: The Intrusion**
Dodeco navigates the dungeon corridors. For several hundred steps, the engine resolves standard locomotion, line-of-sight, and basic monster pathfinding. Eventually, Dodeco breaches the walls of a procedurally generated gold vault. 

**Step 294: The Security Protocol**
Recognising the unauthorised presence within the vault boundaries, the engine spawns a specialised Vault Guard entity. The combat pathways are explicitly bypassed in favour of the escort subroutine. The guard accosts Dodeco, and the message line sternly outputs: *"Move along!"*

**Steps 295–306: The Escort Sequence**
The user entity complies with the guard's directive, moving through the dungeon corridors (`k, y, y, ., k, h, ., k, h, h, .`). The engine meticulously calculates the pathfinding for both the player and the guard. Rather than attacking, the guard dynamically mirrors and escorts the player entity, ensuring they leave the restricted area. Each step burns between 12 and 33 PRNG calls as the engine resolves the complex paired-movement logic.

**Step 307: The Dismissal**
Having successfully escorted Dodeco out of the vault's conceptual boundaries, the guard's operational parameters are fulfilled. The entity is immediately garbage-collected by the engine. 1 PRNG call is consumed to resolve the despawn, and the message line notes: *Suddenly, the guard disappears.*

It is a flawless validation of the vault AI logic, elegantly presented as the surreal experience of a monk being politely but firmly escorted off the premises by an ephemeral security guard who then ceases to exist.
