const fs = require('fs');

const content = fs.readFileSync('js/u_init.js', 'utf8');

const oldContent = `export const Archeologist = [];
export const Barbarian_0 = [];
export const Barbarian_1 = [];
export const Cave_man = [];
export const Healer = [];
export const Knight = [];
export const Monk = [];
export const Priest = [];
export const Ranger = [];
export const Rogue = [];
export const Samurai = [];
export const Tourist = [];
export const Valkyrie = [];
export const Wizard = [];
export const Tinopener = [];
export const Lamp = [];
export const Magicmarker = [];
export const Blindfold = [];
export const Xtra_food = [];
export const Leash = [];
export const Towel = [];
export const Money = [];
export const M_spell = [[], [], []];`;

const trobjContent = fs.readFileSync('tmp-trobj.js', 'utf8');
const newContent = `${trobjContent}
export const Money = [];
export const M_spell = [Healing_book, Protection_book, Confuse_monster_book];`;

fs.writeFileSync('js/u_init.js', content.replace(oldContent, newContent));
