import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static build for GitHub Pages (see scripts/build-static.mjs). Relative
// base so it works under user.github.io/<repo>/.
export default defineConfig(() => {
    const data = JSON.parse(readFileSync(resolve('resources/static/birthday.json'), 'utf8'));
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

    return {
        root: 'resources/static',
        base: './',
        publicDir: false,
        plugins: [
            react(),
            {
                // Title + link-preview tags (WhatsApp reads og:*).
                name: 'birthday-meta',
                transformIndexHtml: (html) =>
                    html
                        .replaceAll('%TITLE%', esc(`🎁 For ${data.to} — a birthday surprise`))
                        .replaceAll('%DESC%', esc(`${data.from} made something special, just for you. Open it with the sound on 🔊`)),
            },
        ],
        build: {
            outDir: resolve('dist'),
            emptyOutDir: true,
        },
    };
});
