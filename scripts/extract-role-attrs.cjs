const fs = require('fs');

const src = fs.readFileSync('nethack-c/upstream/src/role.c', 'utf8');

const match2 = src.match(/const struct Race races\[NUM_RACES \+ 1\] = \{([\s\S]*?)\n\};\n/);

const attrbaseRegex = /\/\*\s+Str\s+Int\s+Wis\s+Dex\s+Con\s+Cha\s+\*\/\s*\{\s*([\d, ]+)\s*\},\s*\{\s*([A-Za-z0-9(), ]+)\s*\}/g;
let arr;
let idx = 0;
while ((arr = attrbaseRegex.exec(match2[1])) !== null) {
    let strMax = arr[2].split(',')[0].trim();
    if(strMax === 'STR18(100)') {
        console.log(`races[${idx}].attrmax = [118, ${arr[2].split(',').slice(1).join(',')}];`);
    } else {
        console.log(`races[${idx}].attrmax = [${arr[2]}];`);
    }
    idx++;
}
