#!/usr/bin/env node
// Reads scorer output (file path as argv[1]), compares screensMatched
// against scores/baseline.json (argv[2]). Exits 1 on regression.
import { readFileSync } from 'fs';

const [resultsFile, baselineFile] = process.argv.slice(2);
if (!resultsFile || !baselineFile) {
  console.error('Usage: check-score.mjs <scorer-output> <baseline.json>');
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

const { results, commit } = extractBundle(readFileSync(resultsFile, 'utf8'));
const current  = sumScreens(results);
const baseline = JSON.parse(readFileSync(baselineFile, 'utf8'));

const delta = current.matched - baseline.screensMatched;
const sign  = delta >= 0 ? '+' : '';

console.log(`Baseline : ${baseline.screensMatched} / ${baseline.screensTotal} screens`);
console.log(`Current  : ${current.matched} / ${current.total} screens  (commit ${commit})`);
console.log(`Delta    : ${sign}${delta}`);

if (current.matched < baseline.screensMatched) {
  console.error(`\nFAIL: score regressed (${current.matched} < ${baseline.screensMatched})`);
  process.exit(1);
}

console.log(`\nPASS${delta > 0 ? ` (+${delta} screens — consider running promote-baseline)` : ''}`);
