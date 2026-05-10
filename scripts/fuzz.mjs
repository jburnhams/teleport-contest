#!/usr/bin/env node

/**
 * Fuzz orchestrator.
 */

import { spawn } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const GEN_SESSION = path.join(ROOT, 'scripts', 'gen-session.mjs');
const RECORD_SESSION = path.join(ROOT, 'scripts', 'record-session.mjs');
const TEST_RUNNER = path.join(ROOT, 'frozen', 'ps_test_runner.mjs');
const RECORDER_BIN = path.join(ROOT, 'nethack-c', 'recorder', 'install', 'games', 'lib', 'nethackdir', 'nethack');

function printHelp() {
  console.log(`
Usage: node fuzz.mjs [options]

Options:
  --count N         sessions to generate and test (default: 10)
  --moves N         moves per session (default: 0)
  --move-set TYPE   passed through to gen-session (default: move)
  --role ROLE       pin role for all sessions (default: random each)
  --output-dir DIR  where to save generated + recorded sessions (default: fuzz-sessions/)
  --keep-all        keep passing sessions too (default: only keep failing)
  --verbose         show per-step PRNG diff on failure
  --seed-start N    start seeds at N, incrementing (default: random)
`);
}

async function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => {
      stderr += d.toString();
      if (options.streamStderr) {
        process.stderr.write(d);
      }
    });
    child.on('error', err => reject(err));
    child.on('close', code => {
      resolve({ code, stdout, stderr });
    });
  });
}


async function main() {
  try {
    await fs.access(RECORDER_BIN);
  } catch (err) {
    console.error(`Error: C recorder binary not found at ${RECORDER_BIN}`);
    console.error('Run: bash nethack-c/build-recorder.sh');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let count = 10;
  let moves = 0;
  let moveSet = 'move';
  let role = null;
  let outputDir = path.join(ROOT, 'fuzz-sessions');
  let keepAll = false;
  let verbose = false;
  let seedStart = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help') {
      printHelp();
      return;
    } else if (arg === '--count') {
      count = parseInt(args[++i], 10);
    } else if (arg === '--moves') {
      moves = parseInt(args[++i], 10);
    } else if (arg === '--move-set') {
      moveSet = args[++i];
    } else if (arg === '--role') {
      role = args[++i];
    } else if (arg === '--output-dir') {
      outputDir = path.resolve(args[++i]);
    } else if (arg === '--keep-all') {
      keepAll = true;
    } else if (arg === '--verbose') {
      verbose = true;
    } else if (arg === '--seed-start') {
      seedStart = parseInt(args[++i], 10);
    }
  }

  await fs.mkdir(outputDir, { recursive: true });

  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < count; i++) {
    const seed = seedStart !== null ? seedStart + i : Math.floor(Math.random() * 9999) + 1;

    const genArgs = ['--seed', seed.toString(), '--moves', moves.toString(), '--move-set', moveSet];
    if (role) {
      genArgs.push('--role', role);
    }

    const stubPath = path.join(outputDir, `fuzz-${seed}-stub.json`);
    genArgs.push('--out', stubPath);

    const genRes = await runCommand('node', [GEN_SESSION, ...genArgs]);
    if (genRes.code !== 0) {
      console.error(`[${i+1}/${count}] Generator failed for seed ${seed}: ${genRes.stderr}`);
      failedCount++;
      continue;
    }

    const summaryLineMatch = genRes.stderr.match(/seed=\d+ role=(.*?\/.*?\/.*?) moves=\d+/);
    const summaryStr = summaryLineMatch ? summaryLineMatch[1] : 'Unknown';

    // We parse the role out of the summary (e.g., Healer/hum/neu) to build a nicer filename
    const roleMatch = summaryStr.match(/^([^\\/]+)/);
    const roleName = roleMatch ? roleMatch[1].toLowerCase() : 'unknown';

    const sessionPath = path.join(outputDir, `fuzz-${seed}-${roleName}-${moves}moves.session.json`);

    const recRes = await runCommand('node', [RECORD_SESSION, stubPath, sessionPath]);
    if (recRes.code !== 0) {
      console.error(`[${i+1}/${count}] Recording failed for seed ${seed}: ${recRes.stderr}`);
      failedCount++;
      continue;
    }

    const runRes = await runCommand('node', [TEST_RUNNER, `--worker-session=${sessionPath}`]);
    let result = null;
    let jsRngLog = [];

    if (runRes.code === 0) {
      const parts = runRes.stdout.split('__RESULT_ONE__\n');
      if (parts.length > 1) {
        try {
          result = JSON.parse(parts[1]);
        } catch(e) {}
      }
    }

    if (!result) {
      console.error(`[${i+1}/${count}] seed=${seed} ${summaryStr} ${moves} moves ... FAIL (runner crash or bad output)`);
      failedCount++;
      continue;
    }

    const rngStr = `${result.metrics.rngCalls.matched}/${result.metrics.rngCalls.total} RNG`;
    const scrStr = `${result.metrics.screens.matched}/${result.metrics.screens.total} screens`;

    if (result.passed) {
      console.error(`[${i+1}/${count}] seed=${seed} ${summaryStr} ${moves} moves ... PASS (${rngStr}, ${scrStr})`);
      passedCount++;
      if (!keepAll) {
        await fs.unlink(stubPath).catch(()=>{});
        await fs.unlink(sessionPath).catch(()=>{});
      }
    } else {
      console.error(`[${i+1}/${count}] seed=${seed} ${summaryStr} ${moves} moves ... FAIL (${rngStr}, ${scrStr})`);

      // we need to get the JS RNG log to diff it
      // this means running the worker again and grabbing it, or just reading it if the runner saved it.
      // But the runner doesn't save it by default in this mode...
      // Let's modify the worker to output the jsRng array if verbose is on? No, frozen.
      // Actually ps_test_runner has a mechanism. But wait, if verbose is true, let's just
      // accept that getting the full JS RNG might be tricky without modifying the frozen file.
      // Let's check ps_test_runner.mjs and see if it gives us error details.
      if (result.error) {
        console.error(`    Error: ${result.error}`);
      }

      // Try to extract divergence from stdout if ps_test_runner printed it
      const divMatch = runRes.stdout.match(/RNG diverge.*|First RNG mismatch.*/si);
      if (verbose && divMatch) {
         console.error(`    ${divMatch[0]}`);
      } else if (verbose && result.error && result.error.includes('RNG')) {
         console.error(`    ${result.error}`);
      }

      failedCount++;
    }
  }

  console.error(`\\nSummary: ${passedCount}/${count} passed`);
  if (failedCount > 0) {
    console.error(`Failing sessions saved to: ${outputDir}/`);
  }

  process.exit(failedCount > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
