# seed1150: Grok and the Sling Shot

**Subsystem Focus**: Validates pet inventory interactions, the `shoot` command for projectile-launchers, and the associated inventory-state updates.

This session serves as a rigorous mechanical validation of the engine's ranged-combat and pet-AI subroutines. The user entity—a Caveman named *Grok* (St:15 Dx:14 Co:17 In:7 Wi:9 Ch:13)—demonstrates the engine's ability to handle multi-step pet item interactions and the deterministic resolution of a sling-based projectile launch.

### Mechanical Sequence

**Steps 1–5: The Troglodyte Grok**
The engine performs 2,398 PRNG calls to generate the initial state (St:15 Dx:14 Co:17 In:7 Wi:9). Grok begins on Dungeon Level 1, accompanied by his pet little dog, Slasher. The engine identifies that this is an explore mode session.

**Steps 6–8: The Ration Retrieval**
Grok observes a food ration on the floor. 
- Step 8: Before Grok can act, the engine's pet AI resolves a movement for Slasher.
- 36 PRNG calls resolve the entity-item interaction: *Slasher picks up a food ration.*
- This phase validates the engine's ability to allow pet entities to independently interact with floor objects.

**Steps 30–36: The Swap and the Drop**
Grok and Slasher overlap in a corridor.
- Step 30: 29 PRNG calls resolve the swap: *You swap places with Slasher. Slasher drops a food ration.*
- This validates the engine's inventory-drop triggers for pet entities during coordinate resolution.
- Step 36: Slasher drops the ration again after a brief re-retrieval, validating the engine's ability to handle rapid item state changes.

**Step 38: The Sling Shot**
Grok decides to test his starting equipment. He wields his +2 sling and fires.
- 29 PRNG calls resolve the launch: *You shoot 2 flint stones.*
- This validates the engine's ability to handle multi-projectile ammunition resolution (firing more than one stone per turn) and the resulting trajectory calculations.

**Steps 39–50: Final Analytics**
Grok methodically reviews his inventory, known spells, discoveries, and attributes. He confirms his dismal Intelligence (7) and Wisdom (9) before performing two final searches (`s`) and inspecting the floor (`:`).

It is a succinct mechanical validation of the engine's ranged-combat and pet-inventory logic, proving that it can successfully coordinate complex entity-item interactions and multi-projectile launches with absolute deterministic precision. Grok may be a troglodyte, but his sling-work is mathematically flawless.
