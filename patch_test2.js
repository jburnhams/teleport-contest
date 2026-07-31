import fs from 'fs';

let content = fs.readFileSync('test/hero_init.test.js', 'utf8');

const importsToAdd = `import { Archeologist, Wizard, Blindfold, Tinopener, Lamp, Magicmarker } from '../js/u_init.js';
`;

content = content.replace(/import \{ u_init_misc, u_init_role, u_init_race, u_init_inventory_attrs, u_init_carry_attr_boost, skill_init \} from '\.\.\/js\/u_init\.js';/,
`import { u_init_misc, u_init_role, u_init_race, u_init_inventory_attrs, u_init_carry_attr_boost, skill_init, Archeologist, Wizard, Blindfold, Tinopener, Lamp, Magicmarker } from '../js/u_init.js';`);

fs.writeFileSync('test/hero_init.test.js', content);
