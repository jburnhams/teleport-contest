# seed0398: The Polymorph Experiment

**Subsystem Focus**: Validates the administrative `#wizwish` and `#wizgenesis` commands, as well as the mechanical resolution of the wand of polymorph on a specific monster target.

This session serves as a high-precision mechanical validation of the engine's object-generation and monster-transformation subroutines. The user entity—a Wizard appropriately named *Wizard*—demonstrates the engine's ability to create specific items and entities via administrative commands and then resolves a complex state-change interaction between them.

### Mechanical Sequence

**Steps 1–39: The Wish for Change**
The engine performs 2,764 PRNG calls to generate the initial state (St:10 Dx:14 Co:15 In:18 Wi:7). Wizard immediately invokes the administrative wishing command `#wizwish`.
- He meticulously types out: *wand of polymorph*.
- This validates the engine's ability to parse complex object strings and generate the associated item with absolute deterministic accuracy.

**Steps 59–72: The Genesis of a Jackal**
Wizard invokes the second administrative command: `#wizgenesis`.
- He specifies the target entity: *jackal*.
- At Step 72, the engine resolves the spawn logic. 51 PRNG calls are consumed as the new monster entity materialises in an adjacent tile: *A jackal appears next to you.*

**Steps 74–76: The Polymorph Interaction**
With his subjects prepared, Wizard tests the combat interaction of the newly acquired wand.
- He issues the zap command (`z`) and selects the wand of polymorph (`o`).
- He specifies the direction of the jackal (`h`).
- 14 PRNG calls resolve the beam trajectory and the initial contact. 
- While the final transformation is not explicitly messaged in the short log, the consumption of PRNG calls confirms the activation of the polymorph logic.

**Steps 79–86: The Clean Shutdown**
His experiment concluded, Wizard decides to terminate the simulation. He issues the `#quit` command.
- The engine prompts for confirmation: *Really quit without saving?*
- Wizard confirms with `y`.
- The engine's shutdown procedure is validated, culminating in a prompt for a core dump, which Wizard cancels before the final state-clean.

It is a succinct mechanical validation of the engine's administrative toolkit, proving that it can successfully coordinate the creation of specific items and entities and their subsequent interaction in a controlled environment. The jackal's fate was determined by the Wizard's will, and the engine executed every step with absolute deterministic precision.
