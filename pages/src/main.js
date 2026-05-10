import { marked } from 'marked';
import { summary, sessionFiles, docContents } from 'virtual:score-data';
import './dashboard.css';

function renderCards() {
    const grid = document.querySelector('.grid');
    if (!grid) return;

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
    grid.innerHTML = cardsHtml;
}

function renderDocs() {
    marked.setOptions({ gfm: true, breaks: false });
    
    const docs = ['diary', 'plan', 'learnings', 'tasks', 'task-a', 'task-b', 'task-c', 'task-d', 'task-e', 'task-f', 'guide-history', 'guide-project'];
    
    const docMap = {
        'diary': 'diary.md',
        'plan': 'plan.md',
        'learnings': 'learnings.md',
        'tasks': 'tasks.md',
        'task-a': 'tasks/A-data-tables.md',
        'task-b': 'tasks/B-rng-foundation.md',
        'task-c': 'tasks/C-display.md',
        'task-d': 'tasks/D-object-system.md',
        'task-e': 'tasks/E-monster-system.md',
        'task-f': 'tasks/F-hero-init.md',
        'guide-history': 'docs/guide/history.md',
        'guide-project': 'docs/guide/project.md'
    };

    docs.forEach(id => {
        const el = document.getElementById('doc-' + id);
        const content = docContents[docMap[id]];
        if (el && content) {
            let md = content;
            md = md.replace(/^(\s*)- \[(\/| )\]/gm, (match, p1, p2) => {
                return p2 === '/' ? p1 + '- [x] ‣IN_PROGRESS‣' : p1 + '- [ ]';
            });
            let html = marked.parse(md);
            html = html.replace(/checked(?=[^>]*>\s*‣IN_PROGRESS‣)/g, 'checked class="in-progress"');
            html = html.replace(/‣IN_PROGRESS‣/g, '');
            el.innerHTML = html;
        }
    });
}

function initDashboard() {
    const matchedScreens = summary.results.reduce((s, r) => s + (r.screen?.matched || 0), 0);
    const totalScreens = summary.results.reduce((s, r) => s + (r.screen?.total || 0), 0);
    
    document.querySelector('.score').innerHTML = `${matchedScreens.toLocaleString()} <span style="font-size: 3rem; color: #64748b; font-weight: 600;">/ ${totalScreens.toLocaleString()}</span>`;
    document.querySelector('.progress-bar').style.width = `${(totalScreens > 0 ? (matchedScreens / totalScreens) * 100 : 0)}%`;
    document.querySelector('.overall-stats').innerHTML = `
        <div>Overall RNG Match: <span>${summary.rngPct}%</span></div>
        <div>Passed Sessions: <span>${summary.passed} / ${summary.total}</span></div>
    `;
    
    const date = new Date(summary.timestamp).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
    document.querySelector('footer').textContent = `Last updated: ${date}`;

    renderCards();
    renderDocs();

    window.showDoc = function(id) {
        document.querySelectorAll('.doc-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.doc-tab').forEach(el => el.classList.remove('active'));
        document.getElementById('doc-' + id).style.display = 'block';
        if (event) event.target.classList.add('active');
    };
}

document.addEventListener('DOMContentLoaded', initDashboard);
