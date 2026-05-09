# seed0004: Feeding the Pony

**Subsystem Focus:** Validates character generation menus, pet AI pathfinding algorithms, and object consumption logic.

This deterministic sequence forces the user entity through the interactive character creation menus before rigorously testing the pet interaction logic. It provides a precise validation of the pathfinding and object consumption subroutines implemented in the monster AI loop, elegantly masked as equestrian care.

### Frame-by-Frame Execution Highlights

**Steps 1–9: Character Selection Prompts**
Unlike `seed8000`, this session begins by validating the interactive character generation menus. The user types `T, e, t, r, a`, naming the entity "Tetra". They answer `y` (yes) to the prompt asking if the engine should pick their race/role/gender. The engine assigns them the role of "Knight" (St:14 Dx:9 Co:11 In:10 Wi:14 Ch:17 Lawful). A massive burst of 3,682 PRNG calls generates the dungeon and the entity's starting inventory, including a saddled pony. 

**Steps 10–326: Reluctant Equestrianism**
Tetra the Gallant wanders the dungeon. The pathfinding logic for the accompanying pet pony is rigorously tested. At Step 34, the engine calculates a morale/pathing check, outputting: *Your saddled pony steps reluctantly onto an orc corpse.* At Step 45, the pony is caught in a bear trap. At Step 203, Tetra moves a boulder (*With great effort you move the boulder.*). At Step 304, Tetra consumes a lichen corpse (*This lichen corpse tastes okay.*), triggering 58 PRNG calls for nutrition and effect calculation.

**Step 327: The Stubborn Mount**
The user entity attempts to swap places with the pony. The engine calculates the interaction and the pony's temperament, resulting in 59 PRNG calls and the message: *You swap places with your saddled pony. The saddled pony kicks!*

**Steps 335–365: Tactical Carrot Deployment (`t`, `*`, `h`, `n`, `y`)**
Determined to win the affection of this hostile AI, the user entity initiates a sequence of object throws (`t`), selecting items from the inventory (`*`), and specifying directions (`h`, `n`, `y`). 
- Step 338: Tetra throws a carrot. 40 PRNG calls determine the trajectory and the pony's reaction. *Your saddled pony eats an uncursed carrot.*
- Step 360: Another throw. 62 PRNG calls. *Your saddled pony eats an uncursed carrot.*
- Steps 363 & 365: Two more carrots are lobbed at the horse, generating 27 and 33 PRNG calls respectively.

**Steps 374–390: The Desperate Hunger (`e`)**
Having thrown all their carrots at the horse, the user entity attempts to eat (`e`) and frantically cycles through their inventory trying to consume items they do not possess, generating a comical string of *You don't have that object* errors before the session mercifully concludes.

It is a rigorous boundary test of the pet interaction logic, presented as the rather poignant spectacle of a knight aggressively throwing vegetables at a hostile horse until they run out of food.
