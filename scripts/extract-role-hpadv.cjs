const fs = require('fs');

const src = fs.readFileSync('nethack-c/upstream/src/role.c', 'utf8');

const match = src.match(/const struct Role roles\[NUM_ROLES\+1\] = \{([\s\S]*?)\n\};\n/);

const hpadvRegex = /\{\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\s*\},\s*\/\* Hit points \*\//g;
let arr;
let idx = 0;
while ((arr = hpadvRegex.exec(match[1])) !== null) {
    console.log(`roles[${idx}].hpadv = { infix: ${arr[1]}, inrnd: ${arr[2]}, lofix: ${arr[3]}, lornd: ${arr[4]}, hifix: ${arr[5]}, hirnd: ${arr[6]} };`);
    idx++;
}
