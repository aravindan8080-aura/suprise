# Birthday surprise 🎁

A static birthday surprise (Laravel 12 + Inertia + React, no database) served under `/birthday`.

## Run

    php artisan serve        # → http://127.0.0.1:8000/birthday
    npm run dev              # only while editing JS/CSS (or `npm run build` once)

Through XAMPP it's also at http://localhost/birthday/public/birthday

## Personalise (no rebuild needed)

Edit `config/birthday.php`: her name, your name, age, the date you got together
(drives the live counter), the balloon reasons, polaroid captions and the letter.

- Photos → `public/media/photos/1.jpg … 5.jpg` (portrait 4:5 looks best)
- Music  → `public/media/music.mp3` (without it a music-box "Happy Birthday" plays)
- Finale sticker → set `sticker` to an image under `public/` (optional)

## The story

1. Gift tag → "Unwrap it" (starts the music)
2. Bow & arrow → pull & release into the heart
3. A tree blooms into a heart made of hearts + "together for" live counter
4. Cake → hold the button (or blow into the mic) to blow out the candles
5. Pop the balloons → reasons she's loved
6. Memory lane polaroids under fairy lights (swipe)
7. Envelope → the letter writes itself
8. Finale with fireworks

## Friend version 🎉

A second, playful best-friend surprise lives at `/birthday/friend`
(static/GitHub Pages: `…/suprise/friend/`). Edit `config/friend.php`; photos go in
`public/media/friend/1.jpg … 4.jpg`, music at `public/media/friend/music.mp3`.

1. VIP party ticket → tear it to enter
2. Friendship-o-meter → overloads past "family"
3. Whack the piñata → LEVEL UP reveal
4. Scratch cards → things only a real friend knows
5. Photo booth strip with camera flashes
6. WhatsApp-style chat from you → send a hug back
7. Disco finale with fireworks

Tip: add `?scene=<name>` to jump to a scene while editing (e.g. `?scene=chat`).
