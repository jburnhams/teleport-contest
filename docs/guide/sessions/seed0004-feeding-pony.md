# seed0004: Feeding the Pony

**Subsystem Focus**: Validates character generation menus, pet AI pathfinding algorithms, and object consumption logic.

**Execution Statistics**: 408 steps, 12084 calls to `rn2()` and its brethren.


This deterministic sequence forces the user entity (a solitary, wandering '@') through the interactive character creation menus before rigorously testing the pet interaction logic. It provides a precise validation of the pathfinding and object consumption subroutines implemented in the monster AI loop, elegantly masked as equestrian care.

### Mechanical Sequence

**Steps 1–9: Character Selection Prompts**
Unlike `seed8000`, this session begins by validating the interactive character generation menus. The user types `T, e, t, r, a`, naming the entity "Tetra". They answer `y` (yes) to the prompt asking if the engine should pick their race/role/gender. The engine assigns them the role of "Knight" (St:14 Dx:9 Co:11 In:10 Wi:14 Ch:17 Lawful). A massive burst of 3,682 calls to `rn2()` and its brethren generates the dungeon and the entity's starting inventory linked list, including a saddled pony (represented with stunning realism as a 'u').

**Steps 10–326: Reluctant Equestrianism**
Tetra the Gallant wanders the dungeon. The pathfinding logic for the accompanying pet pony is rigorously tested. At Step 34, the engine calculates a morale/pathing check, outputting: *Your saddled pony (represented with stunning realism as a 'u') steps reluctantly onto an orc corpse.* At Step 45, the pony is caught in a bear trap. At Step 203, Tetra moves a boulder (*With great effort you move the boulder.*). At Step 304, Tetra consumes a lichen corpse (*This lichen corpse tastes okay.*), triggering 58 calls to `rn2()` and its brethren for nutrition and effect calculation.

**Step 327: The Stubborn Mount**
The user entity (a solitary, wandering '@') attempts to swap places with the pony. The engine calculates the interaction and the pony's temperament, resulting in 59 calls to `rn2()` and its brethren and the message: *You swap places with your saddled pony (represented with stunning realism as a 'u'). The saddled pony (represented with stunning realism as a 'u') kicks!*

**Steps 335–365: Tactical Carrot Deployment (`t`, `*`, `h`, `n`, `y`)**
Determined to win the affection of this hostile AI, the user entity (a solitary, wandering '@') initiates a sequence of object throws (`t`), selecting items from the inventory linked list (`*`), and specifying directions (`h`, `n`, `y`).
- Step 338: Tetra throws a carrot. 40 calls to `rn2()` and its brethren determine the trajectory and the pony's reaction. *Your saddled pony (represented with stunning realism as a 'u') eats an uncursed carrot.*
- Step 360: Another throw. 62 calls to `rn2()` and its brethren. *Your saddled pony (represented with stunning realism as a 'u') eats an uncursed carrot.*
- Steps 363 & 365: Two more carrots are lobbed at the horse, generating 27 and 33 calls to `rn2()` and its brethren respectively.

**Steps 374–390: The Desperate Hunger (`e`)**
Having thrown all their carrots at the horse, the user entity (a solitary, wandering '@') attempts to eat (`e`) and frantically cycles through their inventory linked list trying to consume items they do not possess, generating a comical string of *You don't have that object* errors before the session mercifully concludes.

It is a rigorous boundary test of the pet interaction logic, presented as the rather poignant spectacle of a knight aggressively throwing vegetables at a hostile horse until they run out of food.
