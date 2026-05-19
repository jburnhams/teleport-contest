import fs from 'fs';

let content = fs.readFileSync('js/o_init.js', 'utf8');

// There are multiple `for (let i = bases[oclass]; i < bases[oclass + 1]; ++i)` in o_init.js
// let's just make sure both have the check

content = content.replace(
    /for \(let i = bases\[oclass\]; i < bases\[oclass \+ 1\]; \+\+i\) \{/g,
    `for (let i = bases[oclass]; i < bases[oclass + 1] && i < NUM_OBJECTS; ++i) {`
);

fs.writeFileSync('js/o_init.js', content);
