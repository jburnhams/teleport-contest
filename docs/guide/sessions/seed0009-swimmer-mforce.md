# seed0009: Swimmer and the Lava

**Subsystem Focus**: Validates tutorial generation, environmental hazard checks, and the `m` (force move) override command.

This extremely brief session is a textbook validation of the game's environmental hazard protections, immediately followed by a validation of the user's ability to purposefully override those protections. The user entity—a chaotic Elven Ranger—demonstrates exactly how the engine handles deliberate self-immolation.

### Mechanical Sequence

**Steps 1–13: The Tenderfoot**
The user names their entity `S, w, i, m, m, e, r`. They accept the default chaotic Elven Ranger role, and at Step 13, explicitly answer `y` to the prompt: *Do you want a tutorial?* 165 PRNG calls resolve the transition as the entity is teleported away from the standard dungeon generation and into the tutorial environment. The message line solemnly intones: *Entering the tutorial.* The initial state resolves to (St:14 Dx:11 Co:15 In:14 Wi:14 Ch:7).

**Steps 14–59: The Approach**
Swimmer navigates the tutorial space, encountering various engraved instructions. The engine calculates line-of-sight and basic locomotion as she wanders toward a highly dangerous environmental feature. 

**Step 60: The Warning**
Swimmer attempts to move right (`l`) directly into an adjacent wall of lava. The mathematical engine performs a safety check. Recognising the hazard, it overrides the movement and outputs a helpful warning: *You avoid stepping into the wall of lava.* The engine successfully protects the user from accidental death.

**Steps 61–62: The Override**
Refusing to be told what to do by a procedural safety check, the user presses `m` (the prefix command to force movement) followed immediately by `l` (right). 
- The engine processes the `m` prefix, suspending the lava safety check. 
- It executes the `l` command. 1 PRNG call is consumed to calculate the fatal damage. 
- The message line updates with absolute deterministic certainty: *You fall into the wall of lava! You burn to a crisp...*

**Steps 63–72: Post-Mortem Analytics**
The session concludes with the user process systematically reviewing their character attributes, confirming their 14 Intelligence, and reading the final status line: *You were level 1 with a maximum of 14 hit points when you burned.*

It is a flawless mechanical test of the `m` command, presented as the rather ironic tale of an elf named Swimmer who demanded a tutorial on how to dive into molten rock.
