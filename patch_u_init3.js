import fs from 'fs';

let content = fs.readFileSync('js/u_init.js', 'utf8');

// add missing imports
if (!content.includes('CORNUTHAUM')) {
   // actually the replace didn't work? let's see.
}

const importsToAdd = `import { bases } from './o_init.js';
import { CORNUTHAUM, DUNCE_CAP } from './objects.js';
`;
content = content.replace(/import \{ objects \} from '\.\/objects\.js';/, importsToAdd + `import { objects } from './objects.js';`);

fs.writeFileSync('js/u_init.js', content);
