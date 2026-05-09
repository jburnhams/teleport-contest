#!/usr/bin/env node
// Reads scorer output (argv[1]), updates scores/baseline.json (argv[2])
// if screensMatched improved. Exits 0 either way; the workflow commits
// the file only if git sees a diff.
import { readFileSync, writeFileSync } from 'fs';

const [resultsFile, baselineFile] = process.argv.slice(2);
if (!resultsFile || !baselineFile) {
  console.error('Usage: promote-baseline.mjs <scorer-output> <baseline.json>');
  process.exit(2);
}

function extractBundle(raw) {
  const idx = raw.lastIndexOf('__RESULTS_JSON__');
  if (idx < 0) throw new Error('No __RESULTS_JSON__ marker in scorer output');
  return JSON.parse(raw.slice(idx + '__RESULTS_JSON__'.length).trim());
}

function sumScreens(results) {
  return results.reduce(
    (acc, r) => {
      acc.matched += r.metrics?.screens?.matched ?? 0;
      acc.total   += r.metrics?.screens?.total   ?? 0;
      return acc;
    },
    { matched: 0, total: 0 },
  );
}

const { results, commit, timestamp } = extractBundle(readFileSync(resultsFile, 'utf8'));
const current  = sumScreens(results);
const baseline = JSON.parse(readFileSync(baselineFile, 'utf8'));

console.log(`Baseline : ${baseline.screensMatched} screens`);
console.log(`Current  : ${current.matched} screens  (commit ${commit})`);

if (current.matched > baseline.screensMatched) {
  const next = {
    screensMatched: current.matched,
    screensTotal:   current.total,
    commit,
    timestamp,
  };
  writeFileSync(baselineFile, JSON.stringify(next, null, 2) + '\n');
  console.log(`\nBaseline promoted: ${baseline.screensMatched} → ${current.matched}`);
} else {
  console.log('\nNo change: score did not improve, baseline unchanged');
}
