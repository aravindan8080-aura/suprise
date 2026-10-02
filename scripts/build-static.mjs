// Builds the static, shareable version of the surprise into dist/:
//   1. export config/birthday.php → resources/static/birthday.json (via PHP)
//   2. vite build with vite.static.config.js
//   3. copy public/media (photos, music) next to it
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, writeFileSync } from 'node:fs';
import { build } from 'vite';

const json = execFileSync('php', ['scripts/export-birthday.php'], { encoding: 'utf8' });
writeFileSync('resources/static/birthday.json', json);

await build({ configFile: 'vite.static.config.js' });

if (existsSync('public/media')) cpSync('public/media', 'dist/media', { recursive: true });
writeFileSync('dist/.nojekyll', '');
console.log('\nStatic site ready in dist/');
