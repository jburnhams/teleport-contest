const fs = require('fs');

let testText = fs.readFileSync('test/roles.test.js', 'utf8');

testText = testText.replace(/import \* as C from '\.\.\/js\/const\.js';/,
`import * as C from '../js/const.js';
import * as M from '../js/monst.js';
import * as O from '../js/objects.js';`);

testText = testText.replace(/C\.PM_/g, 'M.PM_');
testText = testText.replace(/C\.ART_/g, 'O.ART_');
testText = testText.replace(/C\.SPE_/g, 'O.SPE_');

fs.writeFileSync('test/roles.test.js', testText);
