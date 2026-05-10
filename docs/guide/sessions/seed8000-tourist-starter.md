# seed8000: The Tourist Starter

**Subsystem Focus**: Validates the `u_init` pathways, standard cursor event dispatching, and initial procedural generation.

This session establishes the baseline validation for the core game loop. Rather than engaging in complex combat, it acts as a mechanical shakedown of the engine's initialisation routines (`u_init`, `mklev.c`) and standard input processing. 

The entity generated is a "Tourist"—a purportedly human female named Contestant who arrives in the dungeon with a camera, a Hawaiian shirt, and exactly $757. On screen, she is represented by a single `@`. Let us review her short, deterministic life frame by frame.

### Mechanical Sequence

**Step 0: Initialisation (NULL key)**
The engine performs exactly 2,975 PRNG calls. This massive burst of computation seeds the universe: character attribute generation (St:9 Dx:14 Co:12 In:11 Wi:16 Ch:16), starting inventory, and the complete procedural generation of Dungeon Level 1. The message line warmly outputs: *Aloha Contestant, welcome to NetHack!*

**Steps 1–10: Locomotion (`l, l, n, j, h, h, y, k, b, l`)**
The user entity tests basic grid traversal, wandering vaguely around the starting room using standard `hjklyubn` directional keys. The map incrementally updates line-of-sight. Crucially, each step generates between 8 and 15 PRNG calls. These calculations are resolving the background monster AI loops, regeneration timers, and nutrition depletion. The internal clock advances from Turn 1 to Turn 11.

**Steps 11–12: Inventory Checks (`i`, `ESC`)**
The user presses `i`. The screen undergoes a massive 20-row redraw to display the inventory (which simply lists "Coins"). The simulation pauses; exactly 0 PRNG calls are consumed. The user clears the screen with `ESC`.

**Steps 13–16: Unsuccessful Magic and Discoveries (`+`, `ESC`, `\`, `ESC`)**
The user presses `+` to cast a spell. The engine curtly responds: *You don't know any spells right now.* The user then presses `\` to open the Discoveries screen, forcing a 13-row redraw. Throughout this UI interaction, the mathematical engine sleeps. 0 PRNG calls are consumed. 

**Steps 17–19: Attribute Review (` `)**
The user reviews their character attributes by pressing the spacebar. The status line meticulously details their distinctly average intellect (*Your intelligence is 11.*) across multiple paginated 20-row redraws. 

**Steps 20–21: Searching (`s`, `s`)**
The user returns to the map and issues the `s` command twice, instructing the entity to search adjacent tiles for hidden doors or traps. The internal clock advances to Turn 13. The engine consumes 14 PRNG calls per search to resolve the probability of discovery. 

**Step 22: Tile Inspection (`:`)**
The user presses `:` to inspect the tile they are currently occupying. The engine evaluates the floor state and outputs: *You see no objects here.* The run concludes gracefully. 

As a validation test, it is flawlessly efficient. As an adventure, it is the story of a tourist who walked in a small circle, checked their pockets, stared at the floor, and immediately ceased to exist.
