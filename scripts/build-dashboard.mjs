import fs from 'fs';
import path from 'path';

// read score-summary.json
let summaryStr;
try {
    summaryStr = fs.readFileSync('score-summary.json', 'utf8');
} catch (e) {
    console.error('Could not read score-summary.json. Run "npm run score" first.');
    process.exit(1);
}
const summary = JSON.parse(summaryStr);

// read all sessions to make manifest.json
const sessionsDir = 'sessions';
let sessionFiles = [];
if (fs.existsSync(sessionsDir)) {
    sessionFiles = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.session.json'));
}

const siteDir = '_site';
if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir, { recursive: true });
}
const siteSessionsDir = path.join(siteDir, 'sessions');
if (!fs.existsSync(siteSessionsDir)) {
    fs.mkdirSync(siteSessionsDir, { recursive: true });
}

// Write manifest.json for the viewer to use instead of directory listing
fs.writeFileSync(path.join(siteSessionsDir, 'manifest.json'), JSON.stringify(sessionFiles));

// Generate index.html
let matchedScreens = 0;
let totalScreens = 0;
for (const res of summary.results) {
    matchedScreens += res.screen?.matched || 0;
    totalScreens += res.screen?.total || 0;
}

const cardsHtml = summary.results.map(r => {
      const isPass = r.passed;
      const rngMatched = r.rng?.matched || 0;
      const rngTotal = r.rng?.total || 1;
      const screenMatched = r.screen?.matched || 0;
      const screenTotal = r.screen?.total || 1;
      
      const rngPct = ((rngMatched / rngTotal) * 100).toFixed(1);
      const screenPct = ((screenMatched / screenTotal) * 100).toFixed(1);
      
      return `<a href="tools/session-viewer/index.html#session=${encodeURIComponent(r.session)}" class="card ${isPass ? 'is-pass' : 'is-fail'}">
          <div class="card-header">
              <span class="session-name">${r.session.replace('.session.json', '')}</span>
              <span class="status ${isPass ? 'pass' : 'fail'}">${isPass ? 'PASS' : 'FAIL'}</span>
          </div>
          <div class="metrics">
              <div class="metric-row">
                  <span class="metric-label">RNG Calls</span>
                  <div>
                      <span class="metric-value">${rngMatched.toLocaleString()} / ${rngTotal.toLocaleString()}</span>
                      <span class="metric-pct">(${rngPct}%)</span>
                  </div>
              </div>
              <div class="metric-row">
                  <span class="metric-label">Screens</span>
                  <div>
                      <span class="metric-value">${screenMatched.toLocaleString()} / ${screenTotal.toLocaleString()}</span>
                      <span class="metric-pct">(${screenPct}%)</span>
                  </div>
              </div>
          </div>
      </a>`;
  }).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NetHack Port Progress</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
  :root {
      --bg: #0f1115;
      --text: #e2e8f0;
      --accent-1: #3b82f6;
      --accent-2: #8b5cf6;
      --pass: #10b981;
      --fail: #ef4444;
      --card-bg: #1e293b;
      --card-border: #334155;
      --font-main: 'Inter', system-ui, sans-serif;
  }
  body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-main);
      margin: 0;
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
  }
  h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
      text-align: center;
  }
  .header-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 4rem;
  }
  .score {
      font-size: 6rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 1rem 0;
      line-height: 1;
      text-align: center;
  }
  .score-label {
      font-size: 1.25rem;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
  }
  .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
      width: 100%;
      max-width: 1400px;
  }
  .card {
      background: var(--card-bg);
      border-radius: 16px;
      padding: 1.5rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      border: 1px solid var(--card-border);
      position: relative;
      overflow: hidden;
  }
  .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--card-border);
      transition: background 0.2s;
  }
  .card.is-pass::before { background: var(--pass); }
  .card.is-fail::before { background: var(--fail); }
  
  .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -8px rgba(0,0,0,0.5);
      border-color: #475569;
  }
  .card.is-pass:hover { border-color: var(--pass); }
  
  .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
  }
  .session-name {
      font-weight: 600;
      font-size: 1.1rem;
      word-break: break-all;
      line-height: 1.4;
      padding-right: 1rem;
      color: #f8fafc;
  }
  .status {
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
  }
  .status.pass { background: rgba(16, 185, 129, 0.15); color: var(--pass); }
  .status.fail { background: rgba(239, 68, 68, 0.15); color: var(--fail); }
  
  .metrics {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      font-size: 0.9rem;
      color: #94a3b8;
      margin-top: auto;
  }
  .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0,0,0,0.1);
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
  }
  .metric-label {
      font-weight: 600;
  }
  .metric-value {
      font-weight: 800;
      color: #f8fafc;
      font-variant-numeric: tabular-nums;
  }
  .metric-pct {
      font-size: 0.8rem;
      opacity: 0.8;
      min-width: 3.5em;
      display: inline-block;
      text-align: right;
  }
</style>
</head>
<body>

<div class="header-container">
    <h1>NetHack Port Progress</h1>
    <div class="score">${matchedScreens.toLocaleString()} <span style="font-size: 3rem; color: #64748b; font-weight: 600;">/ ${totalScreens.toLocaleString()}</span></div>
    <div class="score-label">Screens Matched</div>
</div>

<div class="grid">
  ${cardsHtml}
</div>

</body>
</html>`;

fs.writeFileSync(path.join(siteDir, 'index.html'), html);
console.log('Dashboard generated at _site/index.html');
