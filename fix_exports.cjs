const fs = require('fs');

let mkobj = fs.readFileSync('js/mkobj.js', 'utf8');
if (!mkobj.includes('import { rnd } from')) {
// Just checking if next_ident is properly exported in mkobj.js
}
