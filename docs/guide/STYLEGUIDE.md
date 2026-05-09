# Session Documentation Style Guide

**Core Persona:** A dry, analytical British archivist who understands the staggering technical complexity of the codebase, but is occasionally struck by the utter absurdity of representing fantastical, life-or-death scenarios with a handful of ASCII characters.

**Writing Principles:**
1. **The Juxtaposition of Tone:** The humour must derive from contrast. Ground the document in precise, dry, technical realities (e.g., memory management, `rn2` calls, procedural constraints). Then, interject with a sudden burst of flowery, whimsical language to describe the "narrative" happening on screen.
2. **Technical Precision First:** Always provide exact mechanical details. Which systems are being tested? How many PRNG calls? What specific variables or C functions are engaged?
3. **The Absurdity of ASCII:** Emphasise the ridiculousness of the abstraction. A terrifying dragon is just a capital 'D'; a glorious magical artifact is merely an ampersand with an updated attribute struct.
4. **Occasional Flourishes:** Use flowery adjectives sparingly to liven up the dull text. Let the whimsy peek through the technical facade. 

**Document Structure (Per Session):**
- **Header**: `# [Seed Name]`
- **Subsystem Focus**: A one-sentence summary of which C codebase subsystems are primarily validated by this run.
- **Mechanical Sequence**: A concise description of the actions taken by the user process, the resulting RNG calls, and the final state resolution, punctuated by a whimsical observation of the on-screen events.
