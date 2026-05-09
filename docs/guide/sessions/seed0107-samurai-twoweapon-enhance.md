# seed0107: Bushi's Blade and Bone

**Subsystem Focus:** Validates the `#twoweapon` and `#sit` extended commands, and the engine's ability to process multiple-weapon equipment states.

This session serves as a rigorous mechanical validation of the engine's equipment and posture subroutines. The user entity—a human Samurai named *Bushi*—demonstrates the engine's ability to handle the specialised "two-weapon" combat state and the environmental interactions of the "sit" command.

### Frame-by-Frame Execution Highlights

**Steps 1–3: The Hatamoto Bushi**
The engine performs 2,647 PRNG calls to generate the universe and Bushi's attributes (St:18 Dx:14 Co:18 In:9 Wi:8 Ch:7). Bushi begins on Dungeon Level 1, armed with a katana and a wakizashi, and declines the tutorial.

**Steps 5–15: Mastering the Blade (`#twoweapon`)**
Bushi immediately attempts to utilise his specialised Samurai training. He types out the extended command `#twoweapon`.
- Step 15: The engine's equipment subroutine validates that Bushi is wielding a primary weapon and has a valid off-hand weapon (his wakizashi) available.
- 1 PRNG call resolves the state change.
- The message line confirms the transition: *You begin two-weapon combat.* 
- This validates the engine's ability to process simultaneous damage and hit calculations across two discrete weapon objects.

**Steps 81–85: The Uncomfortable Rest (`#sit`)**
Bushi wanders the dungeon, eventually standing over a lichen corpse. He decides to use the extended command `#sit`.
- The engine's posture subroutine checks the floor tile for interactable objects.
- Step 85: 5 PRNG calls resolve the interaction.
- Recognising the presence of a biological object (the lichen corpse) on the tile, the engine outputs: *You sit on the corpse. It's not very comfortable...*

**Steps 86–97: Final Analytics**
Bushi methodically reviews his inventory, known spells, discoveries, and attributes. He confirms his Intelligence (9) and Wisdom (8) before performing two final searches (`s`) and inspecting the floor (`:`), identifying the lichen corpse he just sat on.

It is a succinct mechanical validation of the engine's state machine, proving that it can successfully coordinate complex equipment flags like "two-weapon" while also handling the whimsical environmental feedback of sitting on deceased dungeon flora. Bushi may have an uncomfortable seat, but the engine is in a state of perfect deterministic comfort.
