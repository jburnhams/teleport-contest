const fs = require('fs');

const src = fs.readFileSync('nethack-c/upstream/src/role.c', 'utf8');

const match2 = src.match(/const struct Race races\[NUM_RACES \+ 1\] = \{([\s\S]*?)\n\};\n/);

const hpadvRegex = /\{\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\s*\},\s*\/\* Hit points \*\//g;
let arr;
let idx = 0;
while ((arr = hpadvRegex.exec(match2[1])) !== null) {
    console.log(`races[${idx}].hpadv = { infix: ${arr[1]}, inrnd: ${arr[2]}, lofix: ${arr[3]}, lornd: ${arr[4]}, hifix: ${arr[5]}, hirnd: ${arr[6]} };`);
    idx++;
}
