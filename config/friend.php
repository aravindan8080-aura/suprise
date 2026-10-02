<?php

/*
|--------------------------------------------------------------------------
| Friend birthday surprise content  (/birthday/friend)
|--------------------------------------------------------------------------
|
| Same idea as config/birthday.php, with a playful best-friend theme.
| Photos go in public/media/friend/ and are referenced relative to public/.
|
*/

return [

    // Your friend's name.
    'to' => env('FRIEND_TO', 'Buddy'),

    // Your name.
    'from' => env('FRIEND_FROM', 'Aravindan'),

    // The age they are turning ("LEVEL 25 UNLOCKED").
    'age' => (int) env('FRIEND_AGE', 25),

    // When you became friends (YYYY-MM-DD) — drives the "days of
    // friendship" counter in the finale; null hides it.
    'friends_since' => env('FRIEND_SINCE', '2015-06-01'),

    // Background music (relative to public/). Missing file → a bright
    // synth "Happy Birthday" plays instead.
    'music' => 'media/friend/music.mp3',

    // Scratch cards — keep it to 3 or 4.
    'scratch' => [
        ['emoji' => '🦸', 'title' => 'The one who shows up', 'text' => 'Every single time I needed someone, you were already on your way.'],
        ['emoji' => '😂', 'title' => 'Professional idiot', 'text' => 'Nobody makes me laugh till my stomach hurts like you do.'],
        ['emoji' => '🍕', 'title' => 'Partner in crime', 'text' => 'Late-night food runs, bad plans, best memories.'],
        ['emoji' => '🫂', 'title' => 'Basically family', 'text' => 'Friends come and go. You? You\'re stuck with me forever.'],
    ],

    // Photo booth strip (relative to public/). Missing files show a fun
    // placeholder with the emoji.
    'photos' => [
        ['photo' => 'media/friend/1.jpg', 'caption' => 'day one chaos', 'emoji' => '🤪'],
        ['photo' => 'media/friend/2.jpg', 'caption' => 'that trip 🔥', 'emoji' => '🚗'],
        ['photo' => 'media/friend/3.jpg', 'caption' => 'we look so innocent here', 'emoji' => '😇'],
        ['photo' => 'media/friend/4.jpg', 'caption' => 'still the best duo', 'emoji' => '🤜🤛'],
    ],

    // The chat at the end — each line pops in as a message from you.
    'chat' => [
        'Hey 👋',
        'HAPPY BIRTHDAY!!! 🎉🎂🥳',
        'Another year older and still not wiser 😂',
        'But seriously — thank you for being the friend everyone wishes they had.',
        'Here\'s to more trips, more stupid ideas and more memories together 🍻',
        'Love you bro, have the best day ever ❤️',
    ],

    // Optional sticker image for the finale (relative to public/).
    'sticker' => null,

];
