<?php

/*
|--------------------------------------------------------------------------
| Birthday surprise content
|--------------------------------------------------------------------------
|
| Everything the /birthday page shows lives here — no database. Edit and
| refresh; no rebuild needed (run `php artisan config:clear` if you have
| cached config).
|
| Photos go in public/media/photos/ and music in public/media/,
| both referenced relative to public/.
|
*/

return [

    // Her name, as it should appear everywhere on the page.
    'to' => env('BIRTHDAY_TO', 'Keerthi'),

    // Your name (shown as "… made this — just for you").
    'from' => env('BIRTHDAY_FROM', 'Aravindan'),

    // The age she is turning.
    'age' => (int) env('BIRTHDAY_AGE', 25),

    // When you got together (YYYY-MM-DD or YYYY-MM-DD HH:MM). Drives the
    // live "together for" counter on the tree scene; null hides it.
    'together_since' => env('BIRTHDAY_TOGETHER_SINCE', '2020-10-26'),

    // Background music (relative to public/). If the file is missing, a
    // soft music-box "Happy Birthday" is played by the browser instead.
    'music' => 'media/music.mp3',

    // One balloon per reason (up to 6 look best).
    'reasons' => [
        'You make normal days feel special ❤️',
        'You make bad days feel lighter 🥰',
        'Nobody listens the way you do 🫂',
        'Your laugh is my favourite sound 😄',
        'You make me want to be better, every day ✨',
    ],

    // Memory lane polaroids. `photo` is relative to public/; a missing file
    // falls back to a pretty placeholder with the emoji.
    'memories' => [
        ['photo' => 'media/photos/1.jpg', 'caption' => 'where it all started 💫', 'emoji' => '💫'],
        ['photo' => 'media/photos/2.jpg', 'caption' => 'that day we couldn\'t stop laughing 😂', 'emoji' => '😂'],
        ['photo' => 'media/photos/3.jpg', 'caption' => 'my favourite trip, with my favourite human 🌍', 'emoji' => '🌍'],
        ['photo' => 'media/photos/4.jpg', 'caption' => 'even when we\'re busy, it\'s us 🤍', 'emoji' => '🤍'],
        ['photo' => 'media/photos/5.jpg', 'caption' => 'still my favourite person 😄', 'emoji' => '😄'],
    ],

    // The letter. Blank lines become paragraph breaks.
    'letter' => <<<'TXT'
Happy Birthday ❤️ Baby

I still don't know how someone like you came into my life, but I'm really thankful for it. I hope this year gives you peace, good health and many little reasons to smile every day 😊

You deserve all the happiness in the world 🎂💖
TXT,

    // Optional sticker image for the finale (relative to public/). Null
    // shows an animated emoji bouquet instead.
    'sticker' => null,

];
