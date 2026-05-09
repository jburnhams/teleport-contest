# The Teleport Project

This project is a bit-exact port of the NetHack 5.0 C codebase into JavaScript. It is not an emulation, nor is it a functional approximation. The objective is to replicate the execution of the original source code precisely enough to yield the exact same pseudo-random number generator (PRNG) sequence and terminal output frame-by-frame. 

A single divergence in an `rn2` (random number) call cascadingly corrupts the entire dungeon state. If the JavaScript port calculates the probability of an Orc dropping a dagger differently than the C implementation, the subsequent map generation diverges, and the automated scorer rejects the run. 

The endeavour requires manually translating the core C logic—including dungeon generation, inventory management, and the monster AI loop—into JS, while carefully preserving every historical quirk of the original deterministic sequence. We rely on 44 recorded canonical C sessions to validate that our state machine aligns flawlessly with the reference architecture.

It is, frankly, a staggering feat of architectural stubbornness. To spend one's evenings meticulously ensuring that a JavaScript loop correctly simulates a 1980s random number generator so that a mythical gnome can steal exactly the right imaginary wand at exactly the right frame—well, there is a profound, if slightly mad, beauty to the whole enterprise.
