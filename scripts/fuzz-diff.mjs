#!/usr/bin/env node

/**
 * Standalone tool to find the first PRNG divergence in a session.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { runSegment } from '../js/jsmain.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Basic screen matching stub since we don't have the full visualizer here,
// and we know if RNG cascaded, screen will fail anyway.
function screensVisuallyEqual(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a === b;
}

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

  for (let segIdx = 0; segIdx < session.segments.length; segIdx++) {
    const seg = session.segments[segIdx];
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
        return;
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
             console.log(`  Screen: PASS`); // approximate
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
