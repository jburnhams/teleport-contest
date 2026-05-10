# seed5006: The Tourist's Self-Inflicted Disaster

**Subsystem Focus:** Validates the administrative wishing system, cursed-item interactions, blindfold state transitions, confused scroll reading, bones-file generation, and cross-segment bones-file retrieval.

This remarkable two-segment session is a methodical stress test of the engine's most exotic state transitions. In Segment 0, a Tourist named *Wizard* systematically accumulates cursed items, blindfolds herself, drinks a potion of confusion, and then misreads a scroll of teleportation before zapping herself with a wand of death. In Segment 1, a Knight—also named *Wizard*—teleports to the same level, retrieves the Tourist's bones file, prays unsuccessfully, and promptly repeats the self-zapping experiment. It is an exercise in administrative self-destruction of considerable thoroughness.

### Mechanical Sequence
### Segment 0: The Tourist's Methodical Demise

**Step 0: Initialisation**
The engine performs 4,180 PRNG calls. Wizard the Rambler emerges as a neutral female human Tourist (St:10 Dx:12 Co:15 In:13 Wi:10 Ch:15) with $307 and the Full Moon luck bonus.

**Steps 2–4: Administrative Teleportation**
Wizard immediately invokes `Ctrl+V` (level teleport) and descends to Dungeon Level 2. 4,133 PRNG calls generate the new level.

**Steps 5–108: The Shopping Spree from Hell**
Wizard invokes `Ctrl+W` (`#wizwish`) six times in succession, each time meticulously typing out a wish character by character:
- Step 27: *cursed leather gloves* → `m - a pair of fencing gloves` (7 PRNG calls)
- Step 49: *ring of regeneration* → `n - a clay ring` (5 PRNG calls)
- Step 60: *blindfold* → `o - a blindfold` (3 PRNG calls)
- Step 85: *scroll of teleportation* → `p - a scroll labeled YUM YUM` (5 PRNG calls)
- Step 108: *cursed bag of holding* → `q - a bag` (9 PRNG calls)
- Step 155: *cursed potion of confusion* → `r - a puce potion` (4 PRNG calls)

**Steps 109–127: The Cursed Glove Trap**
Wizard puts on the clay ring (`P`, `n`, right hand; 9 PRNG calls) and wears the fencing gloves (`W`, `m`; 20 PRNG calls). She then attempts to remove them (`T`, `m`): *You can't. They are cursed.* The engine correctly resolves the BUC-state prevention logic. She then puts on the blindfold (`P`, `o`; 32 PRNG calls): *You are now wearing a blindfold. You can't see any more.* The status line updates to include `Blind`. She removes it shortly after, vision restored.

**Steps 155–165: Confused Teleportation**
Wizard quaffs the cursed potion of confusion (`q`, `r`; 30 PRNG calls): *Huh, What? Where am I?* Status: `Conf`. She then reads the scroll of teleportation while confused (`r`, `p`). The engine calculates the misread: *Being confused, you mispronounce the magic words...* She is teleported to Dungeon Level 3. 2,433 PRNG calls generate the level.

**Steps 166–183: The Final Wish**
Wizard invokes one last wish: *wand of death* → `s - a marble wand` (6 PRNG calls). She zaps it at herself (`.`): *You irradiate yourself with pure energy!*

**Steps 184–193: Death and Bones**
*You die.* The engine, running in Wizard Mode, offers: *Die? [yn] (n)*. Wizard accepts. *Save bones? [yn] (n)* — Wizard accepts. 31 + 42 PRNG calls resolve the death analytics and bones-file metadata. The Tourist's ghost and possessions are preserved for the next visitor.

### Segment 1: The Knight's Pilgrimage to the Bones

**Step 0: A Fresh Start**
*Salutations wizard, welcome to NetHack!* A lawful male human Knight (St:14 Dx:8 Co:10 In:11 Wi:15 Ch:17) materialises on Level 1 with 16 HP.

**Steps 2–7: Bones Retrieval**
The Knight teleports to Dungeon Level 3 — the same level where the Tourist died. The engine detects the bones file: *Get bones? [yn]* → `y`. 49 PRNG calls resolve the bones-file loading. The engine then asks whether to remove the original: *Unlink bones? [yn] (n)*. The default answer is accepted. *You feel like you've been here before.*

**Steps 9–22: Prayer and Divine Punishment**
The Knight invokes `#pray`, confirming the action. *You begin praying to Lugh.* The engine prompts: *Force the gods to be pleased?* The Knight declines. 77 PRNG calls resolve the divine response: *"Thou art arrogant, mortal." "Thou must relearn thy lessons!"* Wi drops from 15 to 14. *You feel foolish!*

**Steps 24–41: The Repeat Performance**
Undeterred by divine rebuke, the Knight wishes for another *wand of death* (`i - an aluminum wand`; 5 PRNG calls) and immediately zaps himself: *You irradiate yourself with pure energy! You die.* He accepts death. *Save bones?* He accepts. The engine detects the existing bones file: *Bones file already exists. Replace it? [yn]*

Two lives, two wands of death, one shared grave. The engine's bones-file persistence infrastructure is validated across the complete lifecycle: generation, retrieval, and replacement negotiation. One cannot help but admire the ruthless efficiency of a testing methodology that involves repeatedly zapping oneself in the face.
