# seed0102: Ricky and the Cancelled Name

**Subsystem Focus:** Validates the `#name` extended command, the `cmdassist` directional helper subroutines, and the graceful handling of command cancellation.

This session serves as a brief but thorough mechanical validation of the engine's UI state machine. The user entity—a human Ranger named *Ricky*—demonstrates the engine's ability to process and cancel complex naming commands and the robust handling of invalid directional inputs.

### Mechanical Sequence

**Steps 1–3: The Tenderfoot**
The engine performs 4,440 PRNG calls to generate the universe and Ricky's attributes (St:14 Dx:11 Co:13 In:13 Wi:14 Ch:10). Ricky begins her journey on Dungeon Level 1, declining the tutorial.

**Steps 4–9: The Naming Protocol**
Ricky decides to use the extended command `#name`. She types out the command character by character (`n, a, m, e`).
- At Step 9, she presses `ENTER`.
- The engine transitions to the naming sub-state and prompts: *What do you want to name?*

**Step 10: The Change of Heart**
At the very next step, Ricky chooses to cancel the naming process.
- She issues the `ESC` command.
- The engine successfully validates the cancellation, returning the state machine to the standard gameplay loop without modifying any object names.

**Steps 11–15: Directional Confusion**
Ricky attempts to interact with her inventory or the environment, but issues a series of keys that the engine's `cmdassist` subroutine must interpret.
- Step 14: After some input, the engine prompts: *In what direction?* 
- Step 15: Ricky inputs `+`.
- The `cmdassist` logic resolves this as an invalid directional input and outputs a specific error message: *cmdassist: Invalid direction key!* 6 PRNG calls are consumed during this validation.

**Steps 16–24: Final Analytics**
Ricky methodically reviews her discoveries and attributes. She confirms her Intelligence (13) and Wisdom (14) before performing two final searches (`s`) and inspecting the floor (`:`), identifying the staircase up.

It is a succinct mechanical validation of the engine's UI flexibility, proving that the state machine can successfully navigate into and back out of specialised sub-menus (like naming) and handle nonsensical directional inputs with absolute deterministic grace. Ricky may have been indecisive about her names, but the engine was perfectly clear about its directional requirements.
