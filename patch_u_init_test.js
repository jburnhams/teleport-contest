import fs from 'fs';

let content = fs.readFileSync('test/hero_init.test.js', 'utf8');

content = content.replace(
  /import \{ PM_ARCHEOLOGIST, PM_WIZARD \} from '\.\.\/js\/const\.js';/,
  `import { PM_ARCHEOLOGIST, PM_WIZARD, PM_BARBARIAN, PM_CAVE_DWELLER, PM_HEALER, PM_KNIGHT, PM_MONK, PM_CLERIC, PM_RANGER, PM_ROGUE, PM_SAMURAI, PM_TOURIST, PM_VALKYRIE } from '../js/const.js';`
);

fs.writeFileSync('test/hero_init.test.js', content);
