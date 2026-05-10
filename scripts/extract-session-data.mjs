#!/usr/bin/env node
// extract-session-data.mjs — Regenerates docs/guide/sessions/data/*.txt
// from the canonical sessions/*.session.json files.
//
// Usage:
//   node scripts/extract-session-data.mjs              # all sessions
//   node scripts/extract-session-data.mjs seed8000     # single session

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const SESSIONS_DIR = 'sessions';
const OUTPUT_DIR = 'docs/guide/sessions/data';

// ── PRNG call detection ──
// Real PRNG calls start with patterns like: rn2(, rn1(, rnd(, rnl(, d(, rne(, rnz(
// Metadata tags start with: ^, >, <
const REAL_RNG_RE = /^(rn[12dlez]|d)\(/;

function countRealPrng(rngEntries) {
    return rngEntries.filter(e => REAL_RNG_RE.test(e)).length;
}

// ── Screen parsing ──
// Screens are ANSI escape sequences. We parse out:
//   - Message line (row 0)
//   - Map rows (rows 1-21)
//   - Status lines (rows 22-23)

function parseScreen(screen) {
    if (!screen) return { msg: '', mapRows: [], statusLine: '' };

    // The screen is a stream of characters and ANSI escapes.
    // Split into rows by \n
    const rawRows = screen.split('\n');

    // Convert ANSI escape sequences for text extraction.
    // Cursor-right (\x1b[NC) becomes N spaces to preserve visual layout.
    // All other ANSI escapes are stripped.
    const stripAnsi = (s) => s.replace(/\x1b\[(\d+)C/g, (_, n) => ' '.repeat(parseInt(n, 10)))
                               .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
                               .replace(/\x0e/g, '')   // SO (shift out)
                               .replace(/\x0f/g, '');   // SI (shift in)

    const rows = rawRows.map(r => stripAnsi(r));

    // Row 0 = message line
    const msg = rows[0] ? rows[0].trim() : '';

    // Rows 1-21 = map (indices 1..21)
    const mapRows = rows.slice(1, 22);

    // Rows 22-23 = status lines
    const status1 = rows[22] ? rows[22].trim() : '';
    const status2 = rows[23] ? rows[23].trim() : '';
    const statusLine = status2 ? `${status1} | ${status2}` : status1;

    return { msg, mapRows, statusLine };
}

function formatKey(key) {
    if (key === '\x00' || key === '' || key === null || key === undefined) return 'NULL (Init)';
    if (key === '\x1b') return 'ESC';
    if (key === '\n' || key === '\r') return '\\n';
    if (key === '\r\n') return '\\n';
    if (key === ' ') return ' ';
    if (key === '\t') return 'TAB';
    // Control characters
    const code = key.charCodeAt(0);
    if (code < 32 && code !== 10 && code !== 13) {
        return `\\x${code.toString(16).padStart(2, '0')}`;
    }
    return key;
}

function processSession(sessionPath) {
    const data = JSON.parse(readFileSync(sessionPath, 'utf8'));
    const lines = [];

    for (let si = 0; si < data.segments.length; si++) {
        const seg = data.segments[si];
        const steps = seg.steps || [];

        lines.push('');
        lines.push(`=== SEGMENT ${si} ===`);

        let prevMapRows = null;
        let prevStatus = null;

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const key = step.key;
            const rng = step.rng || [];
            const prngCount = countRealPrng(rng);
            const keyStr = formatKey(key);

            lines.push(`[Step ${i}] Key: ${keyStr} | PRNG: ${prngCount} calls`);

            // Parse screen
            const { msg, mapRows, statusLine } = parseScreen(step.screen);

            // Message line
            if (msg) {
                lines.push(`  Msg: ${msg}`);
            }

            // Map changes
            if (prevMapRows !== null) {
                let changedRows = 0;
                for (let r = 0; r < Math.max(mapRows.length, prevMapRows.length); r++) {
                    const cur = mapRows[r] || '';
                    const prev = prevMapRows[r] || '';
                    if (cur !== prev) changedRows++;
                }
                if (changedRows > 0) {
                    lines.push(`  Map updated (${changedRows} rows changed)`);
                }
            }

            // Status change
            if (statusLine && statusLine !== prevStatus) {
                if (prevStatus === null) {
                    lines.push(`  Status: ${statusLine}`);
                } else {
                    lines.push(`  Status update: ${statusLine}`);
                }
            }

            prevMapRows = mapRows;
            prevStatus = statusLine;
        }
    }

    lines.push('');
    return lines.join('\n');
}

// ── Main ──
const filter = process.argv[2] || null;
const sessionFiles = readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.session.json'))
    .filter(f => !filter || f.includes(filter))
    .sort();

if (sessionFiles.length === 0) {
    console.error(`No session files found${filter ? ` matching "${filter}"` : ''}`);
    process.exit(1);
}

let count = 0;
for (const sf of sessionFiles) {
    const sessionPath = join(SESSIONS_DIR, sf);
    const name = sf.replace('.session.json', '');
    const outputPath = join(OUTPUT_DIR, `${name}.txt`);

    try {
        const output = processSession(sessionPath);
        writeFileSync(outputPath, output, 'utf8');
        count++;
        console.error(`  ✓ ${name}`);
    } catch (err) {
        console.error(`  ✗ ${name}: ${err.message}`);
    }
}

console.error(`\nRegenerated ${count}/${sessionFiles.length} data files.`);
