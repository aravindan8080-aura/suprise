import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static build for GitHub Pages (see scripts/build-static.mjs). Relative
// base so it works under user.github.io/<repo>/; two pages: the main
// surprise, /friend/ and /propose/.
export default defineConfig(() => {
    const read = (p) => JSON.parse(readFileSync(resolve(p), 'utf8'));
    const birthday = read('resources/static/birthday.json');
    const friend = read('resources/static/friend/friend.json');
    const propose = read('resources/static/propose/propose.json');
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

    const meta = {
        birthday: {
            title: `🎁 For ${birthday.to} — a birthday surprise`,
            desc: `${birthday.from} made something special, just for you. Open it with the sound on 🔊`,
        },
        friend: {
            title: `🎉 ${friend.to}'s birthday party`,
            desc: `You're on the VIP list! ${friend.from} made you a birthday surprise 🥳 Sound on 🔊`,
        },
        propose: {
            title: `💌 For ${propose.to}`,
            desc: `${propose.from} made something just for you. Open it somewhere quiet, with the sound on 🔊`,
        },
    };

    return {
        root: 'resources/static',
        base: './',
        publicDir: false,
        plugins: [
            react(),
            {
                // Title + link-preview tags (WhatsApp reads og:*).
                name: 'birthday-meta',
                transformIndexHtml: (html, ctx) => {
                    const m = ctx.path.includes('propose') ? meta.propose : ctx.path.includes('friend') ? meta.friend : meta.birthday;
                    return html.replaceAll('%TITLE%', esc(m.title)).replaceAll('%DESC%', esc(m.desc));
                },
            },
        ],
        build: {
            outDir: resolve('dist'),
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    main: resolve('resources/static/index.html'),
                    friend: resolve('resources/static/friend/index.html'),
                    propose: resolve('resources/static/propose/index.html'),
                },
            },
        },
    };
});
