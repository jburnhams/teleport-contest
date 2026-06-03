const fs = require('fs');
const path = require('path');

const dir = 'docs/guide/sessions';
const dataDir = path.join(dir, 'data');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if md has PRNG counts
    const mdCallsMatch = content.match(/over ([\d,]+) calls|([\d,]+) calls/i) || content.match(/PRNG calls in this phase rigidly validates/i); // not a good regex but let's see

    // Let's actually look at what data files have
    const dataPath = path.join(dataDir, file.replace('.md', '.txt'));
    if (!fs.existsSync(dataPath)) continue;

    const dataContent = fs.readFileSync(dataPath, 'utf8');
    const callsMatch = dataContent.match(/rn2_calls\s*:\s*(\d+)/i);
    const stepsMatch = dataContent.match(/steps\s*:\s*(\d+)/i);

    if (callsMatch) {
        const calls = callsMatch[1];
        if (!content.includes(calls) && !content.includes(parseInt(calls).toLocaleString())) {
            console.log(`${file}: missing exact rn2 calls ${calls}`);
        }
    }

    if (stepsMatch) {
        const steps = stepsMatch[1];
        if (!content.includes(steps) && !content.includes(parseInt(steps).toLocaleString())) {
            console.log(`${file}: missing exact steps ${steps}`);
        }
    }
}
