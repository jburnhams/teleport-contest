#!/usr/bin/env node

/**
 * Standalone tool to find the first PRNG divergence in a session.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { runSegment } from '../js/jsmain.js';
import { decodeScreen, diffCell, ROWS_24, COLS_80 } from '../frozen/screen-decode.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const STARTUP_VARIANT_LINES = [
    // Match any "Version X.Y.Z..." line — covers patched ("built Sun May  3 ..."),
    // recorder ("last build May 03 ..."), legacy ("Work-in-progress, built ..."),
    // and contestant-port banners ("Teleport JS (experiment ...)" etc).
    /Version\s+\d+\.\d+\.\d+[^\n]*/,
];

// Normalize visible screen text: strip control sequences with no
// visible effect (trailing SI/SO at line ends, leading SI when already
// in ASCII state); collapse build-variant version banner lines.
// Canonicalize SGR (color/attribute) escape sequences. Equivalent
// state transitions can be encoded different ways ("ESC[27m ESC[39m"
// vs "ESC[0m" both reset to default); this rewrites every transition
// to a single minimal canonical form.
function canonSGR(s) {
    const ESC = '\x1b';
    let out = '';
    let fg = 39, bold = false, inverse = false, underline = false;
    let i = 0;
    while (i < s.length) {
        if (s[i] === ESC && s[i + 1] === '[') {
            let j = i;
            let tfg = fg, tbold = bold, tinv = inverse, tul = underline;
            let isSGR = true;
            while (isSGR && s[j] === ESC && s[j + 1] === '[') {
                let k = j + 2;
                const numStart = k;
                while (k < s.length && (s[k] === ';' || (s[k] >= '0' && s[k] <= '9'))) k++;
                if (k >= s.length || s[k] !== 'm') { isSGR = false; break; }
                const params = s.slice(numStart, k).split(';').map(p => p === '' ? 0 : parseInt(p, 10));
                for (const p of params) {
                    if (p === 0) { tfg = 39; tbold = false; tinv = false; tul = false; }
                    else if (p === 1) tbold = true;
                    else if (p === 22) tbold = false;
                    else if (p === 4) tul = true;
                    else if (p === 24) tul = false;
                    else if (p === 7) tinv = true;
                    else if (p === 27) tinv = false;
                    else if ((p >= 30 && p <= 37) || p === 39) tfg = p;
                    else if (p >= 90 && p <= 97) tfg = p;
                }
                j = k + 1;
            }
            if (j > i) {
                if (tfg === 39 && !tbold && !tinv && !tul) {
                    if (fg !== 39 || bold || inverse || underline) out += ESC + '[0m';
                } else {
                    const parts = [];
                    const needReset = (!tbold && bold) || (!tinv && inverse) || (!tul && underline);
                    if (needReset) {
                        parts.push(0);
                        if (tbold) parts.push(1);
                        if (tinv) parts.push(7);
                        if (tul) parts.push(4);
                        if (tfg !== 39) parts.push(tfg);
                    } else {
                        if (tbold && !bold) parts.push(1);
                        if (tinv && !inverse) parts.push(7);
                        if (tul && !underline) parts.push(4);
                        if (tfg !== fg) parts.push(tfg);
                    }
                    if (parts.length) out += ESC + '[' + parts.join(';') + 'm';
                }
                fg = tfg; bold = tbold; inverse = tinv; underline = tul;
                i = j;
                continue;
            }
        }
        out += s[i];
        i++;
    }
    return out;
}

// VT100 alternate-charset (DEC line drawing) → Unicode mapping.
// C-side recordings emit `\x0e<dec-chars>\x0f`; JS contestants
// typically render the Unicode glyphs directly. Both forms render
// identically on a terminal — comparator translates DEC spans to
// Unicode so either representation passes.
const DEC_TO_UNICODE = {
    '`': '\u25c6', a: '\u2592', f: '\u00b0', g: '\u00b1',
    j: '\u2518', k: '\u2510', l: '\u250c', m: '\u2514', n: '\u253c',
    q: '\u2500', t: '\u251c', u: '\u2524', v: '\u2534', w: '\u252c',
    x: '\u2502', y: '\u2264', z: '\u2265', '|': '\u2260',
    o: '\u23ba', s: '\u23bd', '{': '\u03c0', '~': '\u00b7',
};
function translateDecSpans(s) {
    // Walk char-by-char, tracking whether we're in DEC mode (\x0e..\x0f).
    // Inside DEC mode, translate raw chars; preserve ANSI escapes
    // (\x1b[...] and \x0e/\x0f themselves) untouched.
    let out = '';
    let dec = false;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === '\x0e') { dec = true; continue; }
        if (ch === '\x0f') { dec = false; continue; }
        if (ch === '\x1b' && s[i + 1] === '[') {
            // Copy whole CSI sequence verbatim — terminator is in 0x40..0x7e.
            const start = i;
            i += 2;
            while (i < s.length) {
                const c = s.charCodeAt(i);
                if (c >= 0x40 && c <= 0x7e) break;
                i++;
            }
            out += s.slice(start, i + 1);
            continue;
        }
        out += dec ? (DEC_TO_UNICODE[ch] || ch) : ch;
    }
    return out;
}

// Pre-decode normalization: rewrite recording-variant lines (build banner,
// wall-clock timestamps) so they don't surface as char diffs. These are
// out-of-game cosmetic differences the comparator deliberately tolerates
// regardless of bit-exactness elsewhere.
function preDecode(s) {
    let cur = String(s);
    for (const re of STARTUP_VARIANT_LINES) {
        cur = cur.replace(re, '<<VERSION_BANNER>>');
    }
    cur = cur.replace(/^\d{2}:\d{2}:\d{2}\.$/gm, '<time>.');
    return cur;
}

// Decode-then-compare: render both sides to a 24×80 cell grid (the same
// way the Session Viewer does) and check cell-by-cell equality. Picks
// up bit-different SGR encodings as equal when the rendered pixels are
// the same — and ignores attr/color differences on glyphless spaces
// (where they produce no visible pixels).
function screensVisuallyEqual(a, b) {
    const ga = decodeScreen(preDecode(a));
    const gb = decodeScreen(preDecode(b));
    for (let r = 0; r < ROWS_24; r++) {
        for (let c = 0; c < COLS_80; c++) {
            if (diffCell(ga[r][c], gb[r][c])) return false;
        }
    }
    return true;
}

function normalizeScreen(s) {
    let cur = String(s);
    for (const re of STARTUP_VARIANT_LINES) {
        cur = cur.replace(re, '<<VERSION_BANNER>>');
    }
    cur = cur.replace(/^\d{2}:\d{2}:\d{2}\.$/gm, '<time>.');
    cur = canonSGR(cur);
    cur = cur.replace(/\x1b\[(\d+)C/g, (_, n) => ' '.repeat(parseInt(n, 10)));
    // Translate DEC charset spans (\x0e..\x0f) to Unicode. Must run BEFORE
    // the SI/SO commutation loop below, which would move SI/SO past content
    // and make state-machine translation impossible.
    cur = translateDecSpans(cur);
    // After translation there should be no \x0e/\x0f left, but defensively
    // run the original commutation cleanup in case translateDecSpans left
    // any unbalanced markers (e.g. \x0e at end of string).
    cur = cur.replace(/[\x0e\x0f]+$/gm, '');
    cur = cur.replace(/\x0f((?:\x1b\[[0-9;]*[a-zA-Z])*)$/gm, '$1');
    cur = cur.replace(/^\x0f( +\x0e)/gm, '$1');
    let prev;
    do {
        prev = cur;
        cur = cur.replace(/(\x1b\[[0-9;]*[a-zA-Z])\x0f/g, '\x0f$1');
        cur = cur.replace(/\x0e(\x1b\[[0-9;]*[a-zA-Z])/g, '$1\x0e');
        cur = cur.replace(/( +)\x0f/g, '\x0f$1');
        cur = cur.replace(/\x0e( +)/g, '$1\x0e');
        cur = cur.replace(/\x0e\x0f/g, '');
        cur = cur.replace(/\x0f\x0e/g, '');
    } while (cur !== prev);
    return cur;
}

// Build the replay input the judge passes to the contestant — just
// what's needed to launch and play the segment, never the recorded
// answers. Stripping `steps` here is the cheat-prevention boundary:
// the contestant cannot echo back recorded screens/cursors because
// they never see them.
function normalizeRng(entry) {
  if (typeof entry !== 'string') entry = String(entry);
  return entry.replace(/\s*@\s.*$/, '').replace(/^\d+\s+/, '').trim();
}

function isRngCall(s) {
  if (typeof s !== 'string') s = String(s);
  return /^(rn2|rnd|rne|rnz|rn1|d|rnl)\(/.test(normalizeRng(s));
}

async function main() {
  const sessionPath = process.argv[2];
  if (!sessionPath) {
    console.error('Usage: node fuzz-diff.mjs <session.json>');
    process.exit(1);
  }

  // 1. Load C reference data
  const rawSessionStr = await fs.readFile(sessionPath, 'utf8');
  let rawSession;
  try {
    rawSession = JSON.parse(rawSessionStr);
  } catch (e) {
    console.error(`Failed to parse ${sessionPath} as JSON`);
    process.exit(1);
  }

  const session = normalizeSession(rawSession);

  // Extract seed, role, race, moves from nethackrc
  let nethackrc = '';
  let movesCount = 0;
  let seed = 'unknown';
  let movesStr = '';
  if (session.segments && session.segments.length > 0) {
    nethackrc = session.segments[0].nethackrc || '';
    seed = session.segments[0].seed;
    movesStr = session.segments[0].moves || '';
    movesCount = movesStr.length;
  }

  const roleMatch = nethackrc.match(/role:([^,]+)/);
  const role = roleMatch ? roleMatch[1] : 'unknown';
  const raceMatch = nethackrc.match(/race:([^,]+)/);
  const race = raceMatch ? raceMatch[1] : 'unknown';

  console.log(`Session: ${path.basename(sessionPath)}`);
  console.log(`Seed: ${seed}  Role: ${role}  Race: ${race}  Moves: ${movesCount}`);
  console.log('');

  let cascade = false;
  let stepGlobalIdx = 0;
  let overallC_rngMatched = 0;
  let overallC_rngTotal = 0;

  const storage = new Map();
  const storageHandle = {
      getItem(k) { return storage.has(k) ? storage.get(k) : null; },
      setItem(k, v) { storage.set(k, String(v)); },
      removeItem(k) { storage.delete(k); },
      get length() { return storage.size; },
      key(i) {
          let n = 0;
          for (const k of storage.keys()) { if (n === i) return k; n++; }
          return null;
      },
  };

  for (let segIdx = 0; segIdx < session.segments.length; segIdx++) {
    const seg = session.segments[segIdx];


    const input = {
        seed: seg.seed,
        datetime: seg.datetime,
        nethackrc: seg.nethackrc,
        moves: seg.moves,
        storage: storageHandle
    };

    let jsGame;
    try {
        jsGame = await runSegment(input);
    } catch(e) {
        console.error("JS crashed:", e);
        process.exit(1);
    }

    const jsRngSlices = jsGame.getRngSlices() || [];
    const jsScreens = jsGame.getScreens() || [];
    const cSteps = seg.steps || [];

    for (let stepIdx = 0; stepIdx < cSteps.length; stepIdx++) {
      const cStep = cSteps[stepIdx];
      const stepHeader = stepIdx === 0 ? "Step 0 (startup):" : `Step ${stepGlobalIdx} (key='${input.moves[stepIdx-1]}'):`;
      console.log(stepHeader);

      const cRng = (cStep.rng || []).filter(isRngCall);
      let jsRngSlice = stepIdx < jsRngSlices.length ? jsRngSlices[stepIdx] : [];
      jsRngSlice = jsRngSlice.filter(isRngCall);

      overallC_rngTotal += cRng.length;

      let matchedCount = 0;
      let divergeIndex = -1;

      const maxLen = Math.max(cRng.length, jsRngSlice.length);
      for (let i = 0; i < maxLen; i++) {
         const cNorm = i < cRng.length ? normalizeRng(cRng[i]) : undefined;
         const jsNorm = i < jsRngSlice.length ? normalizeRng(jsRngSlice[i]) : undefined;
         if (cNorm === jsNorm && cNorm !== undefined) {
             matchedCount++;
         } else {
             divergeIndex = i;
             break;
         }
      }

      overallC_rngMatched += matchedCount;

      if (cascade !== false) {
         console.log(`  RNG: 0/${cRng.length} matched (cascade from step ${cascade})`);
         console.log(`  Screen: FAIL`);
      } else {
          if (divergeIndex === -1 && cRng.length === jsRngSlice.length) {
             console.log(`  RNG: ${matchedCount}/${cRng.length} matched`);
             const cScreen = cStep.screen || '';
             const jsScreen = stepIdx < jsScreens.length ? jsScreens[stepIdx] : '';
             if (screensVisuallyEqual(cScreen, jsScreen)) {
                 console.log(`  Screen: PASS`);
             } else {
                 console.log(`  Screen: FAIL (Screens differ despite RNG matching)`);
                 cascade = stepGlobalIdx;
             }
          } else {
             console.log(`  RNG: ${matchedCount}/${cRng.length} matched, first divergence at call #${overallC_rngMatched - matchedCount + divergeIndex + 1}`);
             const expected = divergeIndex < cRng.length ? cRng[divergeIndex] : '<none>';
             const expectedNorm = divergeIndex < cRng.length ? normalizeRng(cRng[divergeIndex]) : '<none>';
             const gotNorm = divergeIndex < jsRngSlice.length ? normalizeRng(jsRngSlice[divergeIndex]) : '<none>';

             const contextMatch = expected.match(/(@.*)$/);
             const context = contextMatch ? contextMatch[1] : '';

             console.log(`    #${overallC_rngMatched - matchedCount + divergeIndex + 1} expected: ${expectedNorm}`);
             console.log(`    #${overallC_rngMatched - matchedCount + divergeIndex + 1} got:      ${gotNorm}`);
             if (context) {
                 console.log(`    Context from C log: ${context.trim()}`);
             }
             console.log(`  Screen: FAIL (RNG cascade means screen can't match)`);
             cascade = stepGlobalIdx;
          }
      }
      console.log('');
      stepGlobalIdx++;
    }
  }

}

main().catch(console.error);
