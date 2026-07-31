import fs from 'fs';

let content = fs.readFileSync('tasks/F-hero-init.md', 'utf8');

content = content.replace(
    /- \[ \] Port \`knows_object\(\)\` — mark items as identified/,
    `- [x] Port \`knows_object()\` — mark items as identified`
);

fs.writeFileSync('tasks/F-hero-init.md', content);
