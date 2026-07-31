# seed0103-knight-ride-pony

**Subsystem Focus**: Validates the `#ride` extended command, the dexterity-based success checks for mounting, and fall-damage resolution.
**Execution Statistics**: 60 steps, 2640 PRNG calls.


**Execution Statistics**: 60 steps, 2640 PRNG calls.

This brief but poignant session serves as a rigorous mechanical validation of the engine's riding subroutines. The user entity—a human Knight appropriately named *Sir*—demonstrates the catastrophic deterministic consequences of attempting to mount a pony with low Dexterity (8).

### Mechanical Sequence

**Steps 1–4: The Gallant Sir**
The engine performs 2,432 PRNG calls to generate the universe and Sir's attributes (St:15 Dx:8 Co:11 In:8 Wi:14 Ch:17). Sir begins on Dungeon Level 1, accompanied by a saddled pony, and declines the tutorial.

**Steps 6–12: The First Fall**
Determined to live up to his title, Sir immediately attempts to use the extended command `#ride`. He types out the command and specifies the direction of his saddled pony—represented on this austere terminal simply as a lowercase 'u' (`l`).
- The engine calculates the success probability based on Sir's abysmal Dexterity of 8.
- 2 PRNG calls resolve the check.
- The roll is a failure. The engine calculates the fall damage.
- The message line declares: *You slip while trying to get on the saddled pony.*
- Sir's hit points immediately plummet from 16 to 3. He is now critically injured by an ASCII vowel.

**Steps 13–25: The Short-Lived Equestrian**
Despite his injuries, Sir insists on mastering the art of riding. He initiates the `#ride` command again at Step 13.
- At Step 19, 11 PRNG calls resolve the mounting check. It is a success!
- The message line triumphantly outputs: *You mount the saddled pony.* The engine updates the status line to append the `Ride` flag. Sir is now one with the 'u'.
- However, the glory is fleeting. A few steps later, Sir presses Enter. At Step 25, 37 PRNG calls resolve a forced dismount, and the engine's internal comedy routines trigger the absurd, pop-culture-infused message: *You've been through the dungeon on a pony with no name.*

**Steps 26–50: The Kobold Interlude**
Sir wanders the dungeon on foot. At Step 42, his unmounted pony resolves a combat interaction: *The kobold zombie is destroyed!* Sir attempts to ride again at Step 44, but the 'u' has moved, resulting in the message: *I see nobody there.*

**Steps 51–57: The Final Attempt**
Recovered to a whole 3 hit points, Sir attempts to mount his pony once more. He issued the `#ride` command and targets the pony to his left (`h`).
- The engine again performs the dexterity check.
- Step 57: Another failure. 2 PRNG calls resolve the fall.
- The message line repeats: *You slip while trying to get on the saddled pony.*
- The resulting fall damage (though minor) is sufficient to reduce Sir's remaining 3 hit points to 0.

**Step 58: The Unceremonious End**
The engine resolves the final state change. *You die...*

It is a succinct mechanical validation of the riding interaction matrix, proving that the engine can successfully calculate lethal fall damage from a stationary animal. Sir's grand adventure lasted exactly 58 steps, ended not by a dragon or a demon, but by the relentless mathematics of a saddle he was too clumsy to reach.

One cannot help but admire his persistence, even as the engine meticulously calculated his demise.
