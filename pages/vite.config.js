import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';
import fs from 'fs';

const ROOT = path.resolve(__dirname, '..');

// Helper to read score data
function getScoreData() {
  try {
    const summaryStr = fs.readFileSync(path.join(ROOT, 'score-summary.json'), 'utf8');
    return JSON.parse(summaryStr);
  } catch (e) {
    return { results: [], timestamp: new Date().toISOString(), rngPct: '0.0', passed: 0, total: 0 };
  }
}

// Helper to get session files
function getSessionFiles() {
  const sessionsDir = path.join(ROOT, 'sessions');
  if (fs.existsSync(sessionsDir)) {
    return fs.readdirSync(sessionsDir).filter(f => f.endsWith('.session.json'));
  }
  return [];
}

export default defineConfig({
  base: './',
  root: '.',
  build: {
    outDir: '../_site',
    emptyOutDir: true,
  },
  plugins: [
    {
      name: 'score-data-plugin',
      // ... previous hooks ...
      closeBundle() {
        const dist = path.resolve(ROOT, '_site');
        fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(dist, 'play.html'));
        console.log('[score-data-plugin] Copied index.html to play.html');
      },
      resolveId(id) {
        if (id === 'virtual:score-data') {
          return '\0' + id;
        }
      },
      load(id) {
        // ... (rest of load remains same)
        if (id === '\0virtual:score-data') {
          const summary = getScoreData();
          const sessions = getSessionFiles();
          
          // Also load doc contents
          const docs = [
            'diary.md', 'plan.md', 'learnings.md', 
            'docs/guide/history.md', 'docs/guide/project.md',
            'tasks.md', 'tasks/A-data-tables.md', 'tasks/B-rng-foundation.md',
            'tasks/C-display.md', 'tasks/D-object-system.md',
            'tasks/E-monster-system.md', 'tasks/F-hero-init.md'
          ];
          const docContents = {};
          for (const doc of docs) {
            try {
              docContents[doc] = fs.readFileSync(path.join(ROOT, doc), 'utf8');
            } catch {
              docContents[doc] = `*${doc} not found*`;
            }
          }

          return `
            export const summary = ${JSON.stringify(summary)};
            export const sessionFiles = ${JSON.stringify(sessions)};
            export const docContents = ${JSON.stringify(docContents)};
          `;
        }
      }
    },
    viteStaticCopy({
      targets: [
        { src: path.join(ROOT, 'js'), dest: '.' },
        { src: path.join(ROOT, 'frozen'), dest: '.' },
        { src: path.join(ROOT, 'tools'), dest: '.' },
        { src: path.join(ROOT, 'docs'), dest: '.' },
        { src: path.join(ROOT, 'sessions/*.session.json'), dest: 'sessions' }
      ]
    })
  ]
});
