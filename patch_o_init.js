import fs from 'fs';

const content = fs.readFileSync('js/o_init.js', 'utf8');
const patched = content.replace(
    /for \(let i = bases\[oclass\]; i < bases\[oclass \+ 1\]; \+\+i\) \{/,
    `for (let i = bases[oclass]; i < bases[oclass + 1] && i < NUM_OBJECTS; ++i) {`
);

fs.writeFileSync('js/o_init.js', patched);
