import fs from 'fs';

let content = fs.readFileSync('test/u_init.knows.test.js', 'utf8');

// The objects array starts with oc_name_known initialized to 1 for everything that isn't magic. Wait...
// Let's reset oc_name_known in the setup so we can test changes cleanly.

content = content.replace(
    /        \/\/ ensure bases are initialized so we can loop properly\n        init_objects\(\);/g,
    `        // ensure bases are initialized so we can loop properly
        init_objects();
        for (let i = 0; i < objects.length; i++) {
            if (objects[i]) objects[i].oc_name_known = 0;
        }`
);

fs.writeFileSync('test/u_init.knows.test.js', content);
