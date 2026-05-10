# seed0013: The Friday the 13th Save & Restore

**Subsystem Focus**: Validates environmental datetime flags, the Virtual File System (VFS), and the state serialization/deserialization routines.

This session is fundamentally an infrastructure test disguised as superstitious dungeon crawling. The engine is deliberately fed a specific local datetime (Friday the 13th, during a Full Moon) to validate the datetime logic, before rigorously testing the game's ability to save the entire engine state to disk and successfully restore it in a new segment.

### Mechanical Sequence

#### Segment 0: The Superstitious Setup

**Steps 0–3: Astrological Initialisation**
The engine performs 3,824 PRNG calls to generate the dungeon and the entity—a Chaotic female human Rogue named *Sneaky*. The initialisation logic specifically checks the provided system clock parameters and modifies the game state accordingly. The message line validates these conditional branches: 
- *You are lucky! Full moon tonight.*
- *Watch out! Bad things can happen on Friday the 13th.*

**Steps 4–47: Pointless Meandering**
Knowing the run is doomed to end in a save-state, the user entity wanders aimlessly (`L, l, J, K...`). The engine calculates line-of-sight and basic monster interactions. Sneaky eventually uses the extended command interface (`#`) to check her conduct (`#conduct`). 

**Steps 48–49: State Serialization**
Having accomplished absolutely nothing of value, Sneaky initiates the save sequence (`S`). 
- The engine prompts: *Really save?* 
- The user inputs `y`.
- The engine freezes the state machine, serializes all memory structures, writes them to the VFS, and outputs: *Be seeing you...* before the segment gracefully terminates.

#### Segment 1: The Resurrection

**Steps 0–3: Deserialization**
The harness launches a completely new game segment, passing in the serialized VFS block from Segment 0. 
- The engine successfully deserializes the state, consuming a mere 2 PRNG calls to re-initialize the environment.
- The message line correctly outputs: *Hello Sneaky, the human Rogue, welcome back to NetHack!* 
- Confirming that the datetime environmental flags were successfully preserved in the save block, the engine reiterates: *You are lucky! Full moon tonight.*

The mathematical engine proves its flawless ability to pause existence, compress it into a binary file, and unpack it flawlessly, completely unbothered by the astrological warnings.
