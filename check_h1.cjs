const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('docs/guide/sessions/*.md');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const h1 = lines[0];
    const filename = path.basename(file, '.md');
    const expected = `# ${filename}`;
    if (h1 !== expected) {
        console.log(`Mismatch in ${file}: expected "${expected}", got "${h1}"`);
    }
});
