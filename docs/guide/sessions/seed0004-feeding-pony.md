# seed0004: Feeding the Pony

**Subsystem Focus:** Validates pet AI pathfinding algorithms and object consumption logic.

This deterministic sequence forces the user entity to repeatedly offer a vegetable object to an adjacent "horse" entity. It provides a precise validation of the pathfinding and object consumption subroutines implemented in the monster AI loop. 

Mechanically, the `rn2` resolution engine dictates the probability of a successful state change (taming). The user entity is locked in an execution loop of offering the item until the RNG registers a pass. It is a rigorous boundary test of the pet interaction logic, elegantly presented as the rather poignant, absurd spectacle of an adventurer aggressively throwing carrots at an ASCII equine until it agrees to be their steadfast companion.
