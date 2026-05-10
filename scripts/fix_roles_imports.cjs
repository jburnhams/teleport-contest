const fs = require('fs');

let rolesText = fs.readFileSync('js/roles.js', 'utf8');

rolesText = rolesText.replace(/import \* as C from '\.\/const\.js';/,
`import * as C from './const.js';
import * as M from './monst.js';
import * as O from './objects.js';`);

// In rolesText, we replace:
// C.PM_ => M.PM_
// C.ART_ => O.ART_
// C.SPE_ => O.SPE_
rolesText = rolesText.replace(/C\.PM_/g, 'M.PM_');
rolesText = rolesText.replace(/C\.ART_/g, 'O.ART_');
rolesText = rolesText.replace(/C\.SPE_/g, 'O.SPE_');

// MH_ constants map directly to M2_ constants in C, let's replace C.MH_ with C.M2_ since M2_ are in const.js
rolesText = rolesText.replace(/C\.MH_HUMAN/g, 'C.M2_HUMAN');
rolesText = rolesText.replace(/C\.MH_ELF/g, 'C.M2_ELF');
rolesText = rolesText.replace(/C\.MH_DWARF/g, 'C.M2_DWARF');
rolesText = rolesText.replace(/C\.MH_GNOME/g, 'C.M2_GNOME');
rolesText = rolesText.replace(/C\.MH_ORC/g, 'C.M2_ORC');

fs.writeFileSync('js/roles.js', rolesText);
