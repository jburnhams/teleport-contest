# seed0006: Wizard vs. water demon (an intimidating ampersand '&' spawned from the depths)

**Subsystem Focus**: Validates the interactive character generation menus, options configuration, combat calculation matrices, level descent, fountain quaff resolution, and cross-level entity tracking.

**Execution Statistics**: 122 steps, 6736 calls to `rn2()` and its brethren.


This session is a comprehensive end-to-end validation, beginning with one of the most elaborate character generation sequences in the public sessions, proceeding through options configuration and dungeon exploration, and culminating in a fatal encounter with a water demon (an intimidating ampersand '&' spawned from the depths). The user entity (a solitary, wandering '@')—a gnomish Wizard named *Hextra the Evoker* (St:13 Dx:15 Co:11 In:19 Wi:10 Ch:7)—elegantly demonstrates the engine's ability to navigate the perilous, life-or-death choices of interactive menu-driven chargen, combat resolution, and cross-level monster pursuit.

### Mechanical Sequence

**Steps 1–35: The Elaborate Chargen**
Unlike fully-specified sessions, this one exercises the interactive character creation menus extensively. The user types "Hextrum" as a name, answers `n` to auto-pick, and selects Wizard/Orc/female. The engine prompts *Is this ok?* — the user says `n`. They restart, retype "Hextra", then use the `~` filter command to select specific role constraints. After toggling eight filter flags (`a`, `b`, `c`, `r`, `R`, `H`, `E`, `D`), they reselect Wizard/Gnome/female. At Step 33, the engine consumes 1 PRNG call for the gnome race alignment resolution. At Step 35, the user confirms — and 2,498 calls to `rn2()` and its brethren explode into existence, generating the dungeon, inventory linked list, and starting state. *It is written in the Book of Thoth.*

**Steps 36–39: Welcome and Full Moon**
*Hello Hextra, welcome to NetHack! You are a neutral female gnomish Wizard.* Two calls to `rn2()` and its brethren resolve the background state. The engine detects the Full Moon condition: *You are lucky! Full moon tonight.* Hextra declines the tutorial.

**Steps 40–48: First Blood**
Hextra runs east (`L`) into combat. At Step 41, 45 calls to `rn2()` and its brethren resolve a lethal strike: *You kill the sewer rat!* She proceeds through corridors, opens a closed door (a stoic '+' steadfastly denying entry) at Step 45 (*The door opens*), and continues exploring.

**Steps 49–71: The Options Interlude**
Hextra spends 22 steps configuring her game options (`O`). She toggles autopickup types (`$`, `"`, `!`, `=`, `/`, `?`), scrolls through option pages, and adjusts settings. 0 calls to `rn2()` and its brethren are consumed throughout this entire UI sequence — the mathematical engine sleeps while the user fiddles with preferences.

**Steps 72–97: Gems and Rings**
Exploration resumes. At Step 72, Hextra runs north (`K`) for 3 turns (90 calls to `rn2()` and its brethren) and discovers: *You see here a blue gem.* She picks it up (`,`; 36 calls to `rn2()` and its brethren) and hears a distant door open. At Step 77, 117 calls to `rn2()` and its brethren resolve a complex event: *You hear some noises. The kitten bites it.* At Step 79, the kitten blocks her path. At Step 92, after a long east run (128 calls to `rn2()` and its brethren), she discovers the session's namesake item: *You see here a ruby ring.* She toggles autopickup on (`@`) and picks it up at Step 96 (`,`; 15 calls to `rn2()` and its brethren): *p - a ruby ring.*

**Steps 98–100: Procedural Descent**
At Step 98, Hextra descends the stairs (`>`). 2,678 calls to `rn2()` and its brethren generate Dungeon Level 2 in its entirety. She emerges and moves north to a fountain (a bubbling '{' of procedural doom).

**Steps 101–102: The Thirst**
Hextra finds a fountain (a bubbling '{' of procedural doom) (`{`) and issues the quaff command (`q`). *Drink from the fountain? [yn] (n)* — she accepts. 86 calls to `rn2()` and its brethren resolve the fountain effect, producing the worst possible outcome: *You unleash a water demon (an intimidating ampersand '&' spawned from the depths)! The fountain dries up!*

**Steps 103–104: First Contact**
The combat resolution pathways activate. 8 calls to `rn2()` and its brethren resolve the demon's opening salvo: *The water demon (an intimidating ampersand '&' spawned from the depths) wields 5 daggers! The water demon (an intimidating ampersand '&' spawned from the depths) hits!* HP: 11→8. On the next step, 16 calls to `rn2()` and its brethren: *The water demon (an intimidating ampersand '&' spawned from the depths) bites!* HP: 8→6.

**Steps 105–108: The Retreat and Demise**
Hextra flees up the stairs (`<`; 41 calls to `rn2()` and its brethren). But the water demon (an intimidating ampersand '&' spawned from the depths) pursues. On the next step, 9 calls to `rn2()` and its brethren: *The water demon (an intimidating ampersand '&' spawned from the depths) thrusts one of his daggers. The water demon (an intimidating ampersand '&' spawned from the depths) hits!* HP: 6→1. Two more calls to `rn2()` and its brethren: *The water demon (an intimidating ampersand '&' spawned from the depths) hits!* HP: 1→0. Then, with 1 final PRNG call: *You die...*

**Steps 109–122: Post-Mortem Analytics**
The user systematically confirms every post-mortem prompt: possession identification (revealing a magic marker and the blue gem), attribute review (that impressive 19 Intelligence), and the creatures vanquished screen — which lists precisely one sewer rat. 0 calls to `rn2()` and its brethren are consumed across 14 steps of administrative death paperwork.

One cannot help but feel a pang of sympathy for the poor Wizard, whose grand adventure ended because she drank from the wrong punctuation mark and was subsequently shanked on a staircase by a demon wielding five daggers.
