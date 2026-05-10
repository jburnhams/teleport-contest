#!/usr/bin/env node

/**
 * Standalone tool to find the first PRNG divergence in a session.
 */

import { spawn } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSession } from 'file:///app/frozen/session_loader.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const TEST_RUNNER = path.join(ROOT, 'frozen', 'ps_test_runner.mjs');

function normalizeRng(entry) {
  return entry.replace(/\s*@\s.*$/, '').replace(/^\d+\s+/, '').trim();
}

async function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => stderr += d.toString());
    child.on('error', err => reject(err));
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
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
  if (session.segments && session.segments.length > 0) {
    nethackrc = session.segments[0].nethackrc || '';
    seed = session.segments[0].seed;
    const movesStr = session.segments[0].moves || '';
    movesCount = movesStr.length;
  }

  const roleMatch = nethackrc.match(/role:([^,]+)/);
  const role = roleMatch ? roleMatch[1] : 'unknown';
  const raceMatch = nethackrc.match(/race:([^,]+)/);
  const race = raceMatch ? raceMatch[1] : 'unknown';

  console.log(`Session: ${path.basename(sessionPath)}`);
  console.log(`Seed: ${seed}  Role: ${role}  Race: ${race}  Moves: ${movesCount}`);
  console.log();

  // Load and modify the test runner code slightly to grab the RNG log
  const runnerCode = await fs.readFile(TEST_RUNNER, 'utf8');
  // We'll write a wrapper script that requires the test runner's internals if possible,
  // or we just inject code. The simplest is to modify the frozen runner just for this script,
  // but it's frozen.
  // Wait, let's just run it as-is, and maybe read the log from game.getRngLog()
  // by writing a small wrapper that imports Nethack.


const wrapperCode = `
import * as fs from 'fs';
import { runSegment } from 'file://${path.join(ROOT, 'js/jsmain.js').replace(/\\/g, '/')}';
import { normalizeSession } from 'file://${path.join(ROOT, 'frozen/session_loader.mjs').replace(/\\/g, '/')}';

function isRngCall(entry) {
    return /^(rn2|rnd|rne|rnz|rn1|d|rnl)\\\(/.test(normalizeRng(entry));
}
function normalizeRng(entry) {
    return entry.replace(/\\s*@\\s.*\$/, '').replace(/^\\d+\\s+/, '').trim();
}

async function main() {
    const raw = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
    const cSession = normalizeSession(raw);
    let prevGame = null;

    let fullLog = [];
    for (let i = 0; i < cSession.segments.length; i++) {
        const seg = cSession.segments[i];

        try {
            prevGame = await runSegment(seg, prevGame);
            fullLog.push(...(prevGame.getRngLog() || []));
        } catch (err) {
            if (err.message && err.message.includes('Input queue empty')) {
                // Ignore
            } else {
                throw err;
            }
        }
    }

    if (prevGame) {
        const rngLog = prevGame.getRngLog() || [];
        const jsRng = rngLog.map(e => e.replace(/^\\d+\\s+/, '')).filter(isRngCall);
        fs.writeFileSync('/tmp/fuzz_diff_js_rng.json', JSON.stringify(jsRng));
    } else {
        fs.writeFileSync('/tmp/fuzz_diff_js_rng.json', "[]");
    }
}

main().catch(console.error);
`;


  await fs.writeFile('/tmp/fuzz_diff_wrapper.mjs', wrapperCode);
  const res = await runCommand('node', ['/tmp/fuzz_diff_wrapper.mjs', sessionPath]);

  const jsRng = JSON.parse(await fs.readFile('/tmp/fuzz_diff_js_rng.json', 'utf8'));

  let cRngFlat = [];
  for (const seg of session.segments) {
    if (seg.steps) {
      for (const step of seg.steps) {
        if (step.rng) cRngFlat.push(...step.rng.filter(e => /^(rn2|rnd|rne|rnz|rn1|d|rnl)\(/.test(normalizeRng(e))));
      }
    }
  }

  let diverged = false;
  let jsIdx = 0;
  let cascade = false;

  let globalCIdx = 0;

  for (const seg of session.segments) {
    if (!seg.steps) continue;

    for (let sIdx = 0; sIdx < seg.steps.length; sIdx++) {
      const step = seg.steps[sIdx];
      const cRng = (step.rng || []).filter(e => /^(rn2|rnd|rne|rnz|rn1|d|rnl)\(/.test(normalizeRng(e)));

      const stepName = sIdx === 0 ? 'Step 0 (startup)' : `Step ${sIdx} (key='${seg.moves[sIdx-1] || '?'}')`;
      console.log(`${stepName}:`);

      if (cascade) {
        console.log(`  RNG: 0/${cRng.length} matched (cascade)`);
        console.log(`  Screen: FAIL`);
        console.log();
        continue;
      }

      let matched = 0;
      let divIdx = -1;

      for (let i = 0; i < cRng.length; i++) {
        const cNorm = normalizeRng(cRng[i]);
        const jsNorm = jsRng[jsIdx] ? normalizeRng(jsRng[jsIdx]) : null;

        if (cNorm === jsNorm) {
          matched++;
          jsIdx++;
        } else {
          divIdx = i;
          diverged = true;
          cascade = true;
          break;
        }
      }

      if (divIdx === -1) {
        console.log(`  RNG: ${matched}/${cRng.length} matched`);
        console.log(`  Screen: PASS`);
      } else {
        console.log(`  RNG: ${matched}/${cRng.length} matched, first divergence at call #${globalCIdx + divIdx + 1}`);
        console.log(`    #${globalCIdx + divIdx + 1} expected: ${cRng[divIdx]}`);
        console.log(`    #${globalCIdx + divIdx + 1} got:      ${jsRng[jsIdx] || 'EOF'}`);
        console.log(`  Screen: FAIL`);
      }

      console.log();
      globalCIdx += cRng.length;
    }
  }


}

main().catch(console.error);
