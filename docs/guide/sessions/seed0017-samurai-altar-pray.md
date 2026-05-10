# seed0017: Akira and the Unanswered Prayer

**Subsystem Focus**: Validates the `#pray` extended command, the piety/luck resolution engine, deity-specific message strings, and the character-name entry UI.

This session serves as a focused mechanical shakedown of the engine's prayer subroutines. The user entity—a Samurai named *Akira*—demonstrates the immediate and deterministic consequences of pestering a deity too early in the game.

### Mechanical Sequence

**Steps 0–8: Character Name Entry**
The session now begins with an interactive name-entry phase. The player types "Akirq", corrects the typo with a backspace (Ctrl-H), types "a", and confirms with Enter. The engine consumes 0 PRNG calls during this UI interaction. On confirmation at step 8, the engine fires 2,664 PRNG calls to generate the universe and Akira's attributes (St:15 Dx:18 Co:18 In:8 Wi:9 Ch:9).

**Steps 9–40: The Hatamoto**
Akira begins on Dungeon Level 1, accompanied by his faithful pet dog, Hachi. He wanders the initial room, testing standard locomotion and entity-swapping subroutines.

**Steps 41–46: Initiating Communication (`#pray`)**
Having barely explored a single corridor, Akira decides to petition the divine. He uses the extended command interface to type out `p, r, a, y`. 
- The engine prompts for confirmation: *Are you sure you want to pray?*
- Akira confirms with `y`.

**Steps 47–48: Divine Displeasure**
The engine activates the prayer resolution logic. It checks Akira's current turn count (Turn 1), his piety level (neutral), and his luck.
- 85 PRNG calls are consumed as the engine calculates the deity's reaction.
- Step 47: The message line outputs: *You begin praying to Amaterasu Omikami. You finish your prayer.*
- Step 48: The engine evaluates the "praying too early" penalty. 6 PRNG calls later, the verdict is delivered: *You feel that Amaterasu Omikami is displeased.*

**Steps 49–66: Post-Divine Analytics**
Undeterred by the celestial snub, Akira waits for several turns (`.`), checks his inventory, and reviews his discoveries (identifying his Katana). He confirms his Intelligence (8) and Wisdom (9) before performing two final searches (`s`) and inspecting the floor (`:`). 

It is a succinct mechanical validation of the prayer interaction matrix, proving that the engine can successfully manage the transition from "mortal request" to "divine annoyance" while maintaining perfect deterministic synchronisation. It also confirms that Samurai deities have very little patience for those who pray before they've even found a single gold piece.
