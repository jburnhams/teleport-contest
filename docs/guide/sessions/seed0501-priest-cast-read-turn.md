# seed0501: Clara and the Healing Light

**Subsystem Focus**: Validates spellcasting subroutines (`Z`), spellbook-reading interactions (`r`), and the associated Power (Pw) expenditure logic.

This session serves as a rigorous mechanical validation of the engine's magical infrastructure. The user entity—a human Priestess named *Clara*—demonstrates the engine's ability to process spell selection, mana consumption, and the redundant reading of known spellbooks.

### Mechanical Sequence

**Steps 1–3: The Aspirant Clara**
The engine performs 2,203 PRNG calls to generate the initial state (St:13 Dx:12 Co:13 In:10 Wi:18). Clara begins on Dungeon Level 1 and declines the tutorial.

**Steps 4–6: Casting the Light (`Z`)**
Clara decides to test her divine powers immediately. She issues the cast command (`Z`) and selects her healing spell (`a`).
- Step 5: The engine prompts for a direction. 3 PRNG calls resolve the targeting.
- Clara's Power (Pw) immediately drops from 6 to 1, validating the mana-consumption logic.
- Step 6: 7 PRNG calls resolve the effect: *You feel better.*

**Steps 7–17: The Redundant Study (`r`)**
Clara decides to review her starting spellbook of healing (`g`).
- The engine's study subroutine activates.
- It identifies that Clara already possesses a high proficiency in the spell: *You know "healing" quite well already.*
- The session validates the engine's persistent prompt state. Even as Clara enters a flurry of keys (`y, #, t, u, r, n`), the engine holds the message until she presses `ENTER` at Step 15.
- Step 15: The engine provides a specific query: *Refresh your memory anyway? [yn] (n)*
- Clara chooses to cancel with `ESC`.

**Steps 18–27: Final Analytics**
The session concludes with Clara reviewing her known spells, discoveries, and attributes. She confirms her high Wisdom (18) and Intelligence (10) before performing two final searches (`s`) and inspecting the floor (`:`), identifying the staircase up.

It is a succinct mechanical validation of the engine's magical state machine, proving that it can successfully coordinate mana expenditure, spell-effect resolution, and complex study-logic boundary checks with absolute deterministic precision. Clara's memory is perfectly intact, and the engine's Power counter is perfectly synced.
