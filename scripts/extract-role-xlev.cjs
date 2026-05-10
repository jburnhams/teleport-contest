const fs = require('fs');

const src = fs.readFileSync('nethack-c/upstream/src/role.c', 'utf8');

const match = src.match(/const struct Role roles\[NUM_ROLES\+1\] = \{([\s\S]*?)\n\};\n/);

const attrbaseRegex = /\/\*\s+Energy\s+\*\/\s*(\d+),\s*/g;
let arr;
let idx = 0;
while ((arr = attrbaseRegex.exec(match[1])) !== null) {
    console.log(`roles[${idx}].xlev = ${arr[1]};`);
    idx++;
}
