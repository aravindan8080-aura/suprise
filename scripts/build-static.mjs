// Builds the static, shareable version of every surprise into dist/:
//   dist/index.html         ← config/birthday.php
//   dist/friend/index.html  ← config/friend.php
//   dist/propose/index.html ← config/propose.php
// Steps: export each config to JSON (via PHP), vite build, copy public/media.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, writeFileSync } from 'node:fs';
import { build } from 'vite';

const exportJson = (page, out) => writeFileSync(out, execFileSync('php', ['scripts/export-birthday.php', page], { encoding: 'utf8' }));
exportJson('birthday', 'resources/static/birthday.json');
exportJson('friend', 'resources/static/friend/friend.json');
exportJson('propose', 'resources/static/propose/propose.json');

await build({ configFile: 'vite.static.config.js' });

if (existsSync('public/media')) cpSync('public/media', 'dist/media', { recursive: true });
writeFileSync('dist/.nojekyll', '');
console.log('\nStatic site ready in dist/  (also dist/friend/ and dist/propose/)');
