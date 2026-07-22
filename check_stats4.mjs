import fs from 'fs';
import path from 'path';

const sessionsDir = 'docs/guide/sessions';
const dataDir = path.join(sessionsDir, 'data');

const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.md'));

for (const file of files) {
    const mdPath = path.join(sessionsDir, file);
    const mdContent = fs.readFileSync(mdPath, 'utf8');

    const baseName = path.basename(file, '.md');
    const dataPath = path.join(dataDir, baseName + '.txt');

    let actualSteps = 0;
    let actualPrng = 0;

    if (fs.existsSync(dataPath)) {
        const dataContent = fs.readFileSync(dataPath, 'utf8');
        const lines = dataContent.split('\n');
        for (const line of lines) {
            if (line.match(/^\[Step /)) {
                actualSteps++;
                const prngMatch = line.match(/PRNG: (\d+) calls/);
                if (prngMatch) {
                    actualPrng += parseInt(prngMatch[1], 10);
                }
            }
        }
    } else {
        console.log(`No data file for ${file}`);
    }

    // Check stats
    const statsMatch = mdContent.match(/\*\*Execution Statistics\*\*: (\d+) steps, (\d+) PRNG calls\./);
    let mdSteps = -1;
    let mdPrng = -1;
    if (statsMatch) {
        mdSteps = parseInt(statsMatch[1], 10);
        mdPrng = parseInt(statsMatch[2], 10);
        if (mdSteps !== actualSteps || mdPrng !== actualPrng) {
             console.log(`${file}: Expected ${actualSteps} steps, ${actualPrng} PRNG, Found: ${mdSteps} steps, ${mdPrng} PRNG`);
        }
    } else {
         console.log(`${file}: Stats not found in md`);
    }
}
