import fs from 'fs';
import { decodeScreen, renderCell } from '../frozen/screen-decode.mjs';

const file = process.argv[2];
if (!file) {
    console.error('Usage: node tools/summarize-session.mjs <session.json>');
    process.exit(1);
}

const d = JSON.parse(fs.readFileSync(file, 'utf8'));

d.segments.forEach((seg, sIdx) => {
    console.log(`\n=== SEGMENT ${sIdx} ===`);
    let prevScreen = null;
    seg.steps.forEach((step, idx) => {
        const key = step.key === null ? 'NULL (Init)' : step.key === '\r' ? '\\r (Enter)' : step.key === '\x1b' ? 'ESC' : step.key;
        const rngCount = step.rng ? step.rng.length : 0;
        const grid = decodeScreen(step.screen);
        
        let msgLine = grid[0].map(c => renderCell(c)).join('').trim();
        let statusLine = grid[22].map(c => renderCell(c)).join('').trim() + " | " + grid[23].map(c => renderCell(c)).join('').trim();
        
        console.log(`[Step ${idx}] Key: ${key} | PRNG: ${rngCount} calls`);
        if (msgLine) console.log(`  Msg: ${msgLine}`);
        if (idx === 0) {
            console.log(`  Status: ${statusLine}`);
        } else if (prevScreen) {
            let mapChanges = 0;
            for (let r = 1; r < 22; r++) {
                const prevRow = prevScreen[r].map(c => renderCell(c)).join('');
                const curRow = grid[r].map(c => renderCell(c)).join('');
                if (prevRow !== curRow) {
                    mapChanges++;
                }
            }
            if (mapChanges > 0) {
                console.log(`  Map updated (${mapChanges} rows changed)`);
            }
            
            const prevStatus = prevScreen[22].map(c => renderCell(c)).join('').trim() + " | " + prevScreen[23].map(c => renderCell(c)).join('').trim();
            if (statusLine !== prevStatus) {
                console.log(`  Status update: ${statusLine}`);
            }
        }
        prevScreen = grid;
    });
});
