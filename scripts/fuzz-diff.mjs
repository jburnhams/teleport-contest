#!/usr/bin/env node

/**
 * Standalone tool to find the first PRNG divergence in a session.
 */

import { spawn } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSession } from '../frozen/session_loader.mjs';

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

  // Run the test runner
  const testRunnerProc = spawn('node', [TEST_RUNNER, '--worker-session=' + sessionPath], { stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  testRunnerProc.stdout.on('data', d => stdout += d.toString());
  testRunnerProc.stderr.on('data', d => stderr += d.toString());

  await new Promise(resolve => testRunnerProc.on('close', resolve));

  const parts = stdout.split('__RESULT_ONE__\n');
  if (parts.length < 2) {
    console.error('Test runner output not understood.');
    process.exit(1);
  }

  let result;
  try {
    result = JSON.parse(parts[1]);
  } catch (e) {
    console.error('Failed to parse test runner output');
    process.exit(1);
  }

  if (result.passed) {
    console.log('Session PASSED - no divergence.');
    return;
  }

  if (result.error) {
     console.log(result.error);
  }
}
main().catch(console.error);
