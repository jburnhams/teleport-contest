# seed0014: Dequa and the Fountain Dip

**Subsystem Focus**: Validates the `#dip` extended command, equipment attribute modification, and town watchman AI triggers.

This session provides a rigorous mechanical shakedown of the object dipping subroutines. The user entity—a Lawful Dwarven Valkyrie named *Dequa*—demonstrates the engine's ability to handle complex item-environment interactions and the resulting legal repercussions in a procedurally generated dungeon.

### Mechanical Sequence

**Steps 1–13: The Stripling Valkyrie**
Dequa is created through a sequence of manual menu selections (`v` for Valkyrie, `d` for Dwarf). The engine calculates her impressive Strength (18/02) and Constitution (18) across 2,953 PRNG calls. Upon materialising, she is greeted by the light of a Full Moon, granting her a deterministic luck bonus.

**Steps 14–700: The Exploration**
For nearly 700 steps, Dequa explores the dungeon. This phase validates the core locomotion, line-of-sight, and monster movement algorithms. Along the way, she acquires and dons an *orcish helm* with a dismal -4 enchantment, a fact that the mathematical engine tracks with cold, binary precision.

**Steps 701–710: The First Dip Attempt**
Dequa encounters a fountain and initiates the `#dip` extended command. She selects her orcish helm (`h`) and confirms her desire to submerge it. The engine calculates the probability of various outcomes. In this first instance, 97 PRNG calls are consumed, but the fountain remains largely unresponsive to the presence of orcish headgear.

**Steps 711–713: The Bath and the Law**
Persistent in her hygiene, Dequa attempts to dip the helm again. This time, the PRNG roll triggers a more dramatic interaction:
- Step 711: The engine overrides her intent with a psychological status change. *An urge to take a bath overwhelms you.*
- Step 712: The engine calculates the loss of wealth. *You lost some of your gold in the fountain!* 
- Step 713: The noise of the splashing gold triggers the local town watchman AI. A watchman entity is spawned (or alerted) and bellows: *"Hey, stop using that fountain!"*

It is a comprehensive validation of the fountain interaction matrix, proving that the engine can successfully manage the transition from "cleaning an orcish helm" to "accidental public bathing and subsequent police harassment" without missing a single PRNG call.
