# seed0007: Rogue vs. The Snake Swamp

**Subsystem Focus**: Validates manual character generation menus, fountain effect matrices, and multiple-entity combat resolution.

This session serves as a rigorous evaluation of the manual character creation menus and the brutal efficiency of the engine's area-of-effect spawning logic. The user entity—an Orcish Rogue styled as *Septor the Footpad*—navigates through multiple UI prompts to assert his existence, only to be promptly un-made by a fountain.

### Mechanical Sequence

**Steps 1–14: Asserting Identity**
Unlike standard runs which rely on automatic generation, the user asserts direct control over the character creation process. They type `S, e, p, t, o, r` to name the entity. At Step 7, they explicitly decline automatic role selection (`n`), instead navigating the menus to manually request the role of Rogue (`r`), the male gender (`m`), and the Orcish race (`o`). 
At Step 14, the engine validates these choices with a massive 2,817 PRNG call sequence, generating the dungeon and dropping Septor into existence with a lock pick and an empty sack. The initial state resolves to (St:13 Dx:17 Co:14 In:10 Wi:10 Ch:11).

**Steps 15–287: The Descent**
Septor successfully descends to Dungeon Level 2. The simulation validates standard locomotion, pathfinding, and line-of-sight algorithms over several hundred steps. He encounters a magical amulet and equips it (`P`), triggering 40 PRNG calls as the engine updates his equipment status. 

**Steps 288–289: The Unfortunate Quaff**
Septor encounters a fountain and issues the quaff command (`q`, `y`). The mathematical engine references the fountain effects table and hits upon a catastrophic edge case. 346 PRNG calls are consumed in a single frame as the game spawns multiple hostile entities in adjacent tiles. The message line coldly declares: *An endless stream of snakes pours forth! The fountain dries up!*

**Steps 290–291: The Swamp Consumes**
Surrounded by newly generated `S` (snake) entities, the combat pathways activate. The engine calculates the initiative and attack probabilities of the water moccasins. 
- Step 290: *The water moccasin bites! The water moccasin bites!* Septor's HP plummets from 10 to 4 in a flurry of 45 PRNG calls.
- Step 291: A final calculation. *You die...*

**Steps 292–301: The Post-Mortem**
The user painstakingly pages through the post-mortem screens, confirming (`y`) their desire to see their completely useless attributes and their empty sack. The mathematical engine rests, having flawlessly validated the rule that drinking from strange dungeon fountains is an inherently fatal activity.
