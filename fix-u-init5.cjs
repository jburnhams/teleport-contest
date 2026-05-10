const fs = require('fs');
let content = fs.readFileSync('js/u_init.js', 'utf8');

content = content.replace("TIN_OPENER,", "TIN_OPENER, ORANGE, FORTUNE_COOKIE, MACE,");
fs.writeFileSync('js/u_init.js', content);
