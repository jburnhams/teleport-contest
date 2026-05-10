import { game } from './js/gstate.js';
import { runSegment } from './js/jsmain.js';
import { diffCell, decodeScreen } from './frozen/screen-decode.mjs';
import fs from 'fs';

const session = JSON.parse(fs.readFileSync('sessions/seed8000-tourist-starter.session.json'));
game.flags = {};
const nhGame = await runSegment(session.segments[0]);
const screens = nhGame.getScreens();

console.log('--- Screen 11 ---');
console.log(session.segments[0].steps[11].screen);
console.log('--- J Screen 11 ---');
console.log(screens[11]);
