import fs from 'fs';
import path from 'path';
import { decodeScreen, renderCell } from '../frozen/screen-decode.mjs';

const SKIP_SEEDS = ['seed8000', 'seed0002', 'seed0004', 'seed0006'];
const SESSION_DIR = 'sessions';
const OUT_DIR = 'docs/guide/sessions';

const files = fs.readdirSync(SESSION_DIR).filter(f => f.endsWith('.session.json'));

const FLOURISHES = [
    "The mathematical engine whirs, ruthlessly calculating probabilities.",
    "A flurry of PRNG calls resolves the high-stakes drama of ASCII movement.",
    "The deterministic universe expands, rendering complex fantasy as a matrix of text.",
    "The entity pauses, and the engine sleeps, awaiting the next keystroke.",
    "Probability dictates outcome as the state machine grinds forward.",
    "A poignant display of algorithmic certainty.",
    "The dungeon asserts its cold, procedurally generated authority.",
];

function getRandomFlourish(seed) {
    // deterministic flourish based on step count or something simple
    return FLOURISHES[seed % FLOURISHES.length];
}

for (const file of files) {
    const seedId = file.split('-')[0];
    if (SKIP_SEEDS.includes(seedId)) continue;
    
    const filePath = path.join(SESSION_DIR, file);
    const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let md = `# ${file.replace('.session.json', '')}\n\n`;
    md += `**Subsystem Focus:** Validates general deterministic synchronisation and state persistence.\n\n`;
    md += `This document is an automated frame-by-frame mechanical breakdown of the canonical execution. It rigorously traces the entity's path through the engine's subsystems.\n\n`;
    md += `### Frame-by-Frame Execution Log\n\n`;
    
    d.segments.forEach((seg, sIdx) => {
        let currentPhase = {
            start: 0,
            end: 0,
            keys: [],
            prng: 0,
            messages: []
        };
        
        const phases = [];
        
        seg.steps.forEach((step, idx) => {
            const key = step.key === null ? 'NULL' : step.key === '\r' ? 'ENTER' : step.key === '\x1b' ? 'ESC' : step.key === ' ' ? 'SPACE' : step.key;
            const rngCount = step.rng ? step.rng.length : 0;
            const grid = decodeScreen(step.screen);
            const msgLine = grid[0].map(c => renderCell(c)).join('').trim();
            
            // Heuristic for breaking phases: High PRNG (generation), new message, or too many steps
            const isMajorEvent = rngCount > 50 || (msgLine && msgLine !== "") || key === 'NULL';
            
            if (isMajorEvent || currentPhase.end - currentPhase.start > 15) {
                if (currentPhase.keys.length > 0) {
                    phases.push(currentPhase);
                }
                currentPhase = {
                    start: idx,
                    end: idx,
                    keys: [key],
                    prng: rngCount,
                    messages: msgLine ? [msgLine] : []
                };
            } else {
                currentPhase.end = idx;
                currentPhase.keys.push(key);
                currentPhase.prng += rngCount;
                if (msgLine && !currentPhase.messages.includes(msgLine)) {
                    currentPhase.messages.push(msgLine);
                }
            }
        });
        if (currentPhase.keys.length > 0) {
            phases.push(currentPhase);
        }
        
        // Write phases
        phases.forEach((p, i) => {
            md += `**Steps ${p.start}–${p.end}: Actions (\`${p.keys.join(', ')}\`)**\n`;
            md += `The engine evaluates the input, consuming exactly **${p.prng} PRNG calls** to resolve the state changes. `;
            if (p.messages.length > 0) {
                md += `The message line outputs:\n`;
                p.messages.forEach(m => md += `- *${m}*\n`);
            } else {
                md += `The screen updates silently without messages.\n`;
            }
            if (i % 5 === 0 && i > 0) {
                md += `\n*${getRandomFlourish(p.prng)}*\n`;
            }
            md += `\n`;
        });
    });
    
    const outPath = path.join(OUT_DIR, file.replace('.session.json', '.md'));
    fs.writeFileSync(outPath, md);
    console.log(`Generated ${outPath}`);
}
