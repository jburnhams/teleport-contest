import fs from 'fs';

let content = fs.readFileSync('js/u_init.js', 'utf8');

// The issue is that Archeologist and Wizard are used in u_init_role before they are defined.
// They are defined later in the file as `export const Archeologist = [...]`.
// We need to move the const arrays (Archeologist, Barbarian_0, etc.) above `u_init_role` so they are defined when used.

// They start at "export const Archeologist = [" and end right before "export function ini_inv_mkobj_filter"
// Actually, with let/const in JS, they are hoisted but remain in the TDZ. So using them before definition fails.

// Let's just change them to 'var' so they are hoisted, or move them. Moving is safer.

const arraysRegex = /(export const Archeologist = [\s\S]*?export const M_spell = \[Healing_book, Protection_book, Confuse_monster_book\];)/;

const match = content.match(arraysRegex);

if (match) {
    const arraysStr = match[0];
    content = content.replace(arraysStr, "");

    // insert them right before u_init_role
    content = content.replace("export function u_init_role() {", arraysStr + "\n\nexport function u_init_role() {");

    fs.writeFileSync('js/u_init.js', content);
} else {
    console.log("Could not find arrays to move.");
}
