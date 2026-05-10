# seed1800: Touristo and the Proverbial Cookie

**Subsystem Focus**: Validates the `eat` command specifically for fortune cookies, the deterministic generation of fortune strings, and the `throw` command logic for projectiles.

This session serves as a delightful mechanical validation of the engine's object-consumption and randomised-text subroutines. The user entity—a Tourist named *Touristo*—demonstrates the engine's ability to process the complex, multi-stage interaction of eating a fortune cookie and the subsequent deterministic selection of a fortune message.

### Mechanical Sequence

**Steps 1–3: The Rambler Touristo**
The engine performs 2,360 PRNG calls to generate the universe and Touristo's attributes (St:15 Dx:10 Co:15 In:11 Wi:8). Touristo begins on Dungeon Level 1, armed with a starting inventory of food and darts.

**Steps 4–7: The Cookie Resolution**
Touristo decides to address his starting hunger by eating a fortune cookie (`b`).
- Step 5: 3 PRNG calls resolve the consumption: *This fortune cookie is delicious!*
- Step 6: The engine triggers the secondary effect of the cookie object: *This cookie has a scrap of paper inside. It reads:*
- Step 7: 7 PRNG calls resolve the deterministic selection of the fortune from a large pool of strings. The result is a piece of sage advice: *They say the gods get angry if you kill your dog.*
- This validates the engine's ability to maintain a consistent mapping between a PRNG seed and a specific text string from the game's data files.

**Steps 9–11: The Thrown Projectile**
Touristo decides to test his ranged combat. He issues the throw command (`t`) and selects an item (`a`).
- Step 11: 28 PRNG calls resolve the trajectory and the final resting place of the thrown object. 
- This validates the engine's ability to handle basic projectile physics on Turn 1.

**Steps 12–22: The Application Error Loop**
Touristo attempts to apply an item using the `a` command. 
- He enters a series of invalid keystrokes (`l, i, +, \, SPACE`).
- For each input, the engine's object-selection subroutine performs a lookup and correctly fails to find the item in his pack: *You don't have that object.*
- This validates the persistence of the "apply" sub-state until the user explicitly cancels with `ESC` at Step 22.

**Steps 23–25: Final Analytics**
Touristo performs two final searches (`s`) and inspects the floor (`:`), identifying the staircase up out of the dungeon.

It is a succinct mechanical validation of the engine's item-interaction and message-rendering logic, proving that even a single cookie can provide a wealth of deterministic data. Touristo may have only learned a simple proverb, but the engine resolved every byte of that message with absolute precision.
