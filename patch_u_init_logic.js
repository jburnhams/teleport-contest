import fs from 'fs';

let content = fs.readFileSync('js/u_init.js', 'utf8');

// The reviewer was mistaken about the C code structure!
// The C code IS exactly what I wrote:
// if (sym == WEAPON_CLASS) {
//     odummy.otyp = ct;
//     if ((!Role_if(PM_KNIGHT) && !Role_if(PM_SAMURAI)) && is_pole(o)) continue;
//     if (Role_if(PM_RANGER) && (!is_launcher(o) && !is_ammo(o) && !is_spear(o))) continue;
//     if (Role_if(PM_ROGUE) && (objects[o->otyp].oc_skill != P_DAGGER)) continue;
// }
//
// There is NO `else continue;`.
// Let's print out the exact lines from C to be sure.
