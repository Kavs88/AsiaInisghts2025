const { execSync } = require('child_process');
const fs = require('fs');
const out = execSync("git show 982ed142:app/page.tsx").toString();
fs.writeFileSync("old_page.tsx", out, 'utf8');
