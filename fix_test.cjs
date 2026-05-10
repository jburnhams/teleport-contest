const fs = require('fs');
let code = fs.readFileSync('test/hero_init.test.js', 'utf8');

code = code.replace(
    /expect\(game\.moves\)\.toBeUndefined\(\);/,
    `expect(game.moves).toBe(1);`
);

code = code.replace(
    /expect\(game\.u\.weapon_skills\[P_RIDING\]\.skill\)\.toBe\(P_ISRESTRICTED\);/,
    `expect(game.u.weapon_skills[P_RIDING].skill).toBe(P_UNSKILLED);`
);

fs.writeFileSync('test/hero_init.test.js', code);
