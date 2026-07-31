import fs from 'fs';

let content = fs.readFileSync('js/u_init.js', 'utf8');

content = content.replace(/import \{ objects \} from '\.\/objects\.js';\n/g, "");

content = `import { objects } from './objects.js';
` + content;

fs.writeFileSync('js/u_init.js', content);
