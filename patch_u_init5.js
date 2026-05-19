import fs from 'fs';

let content = fs.readFileSync('js/u_init.js', 'utf8');

content = content.replace(
    /export function discover_object\(obj, a, b, c\) \{[\s\S]*?\}/,
    `export function discover_object(obj, a, b, c) {
    if (objects[obj]) {
        objects[obj].oc_name_known = 1;
    }
}`
);

fs.writeFileSync('js/u_init.js', content);
