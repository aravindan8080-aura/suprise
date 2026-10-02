<?php

/*
|--------------------------------------------------------------------------
| Proposal content  (/birthday/propose)
|--------------------------------------------------------------------------
|
| A "museum" of your story that ends with the question. Photos go in
| public/media/propose/ and are referenced relative to public/. Missing
| photos fall back to soft placeholders, so it works before you add any.
|
*/

return [

    // Her name and yours.
    'to' => env('PROPOSE_TO', 'Sweetheart'),
    'from' => env('PROPOSE_FROM', 'Aravindan'),

    // The question on the final screen.
    'question' => 'Will you marry me?',

    // Background music (relative to public/). Missing → a soft music box.
    'music' => 'media/propose/music.mp3',

    // Optional photo of you two for the opening "From me to you" screen.
    'couple_photo' => 'media/propose/couple.jpg',

    // The love quote. Words in [brackets] get a highlighter swipe.
    'quote' => [
        'In your [smile], I found my [peace].',
        'In your [love], I found my [home].',
    ],

    // Room 1 — the gallery. Each photo is covered in gold foil to scratch.
    'gallery' => [
        ['photo' => 'media/propose/1.jpg', 'title' => 'The first hello', 'emoji' => '👋'],
        ['photo' => 'media/propose/2.jpg', 'title' => 'Our first trip', 'emoji' => '🌄'],
        ['photo' => 'media/propose/3.jpg', 'title' => 'Lazy Sundays', 'emoji' => '☕'],
        ['photo' => 'media/propose/4.jpg', 'title' => 'Still my favourite', 'emoji' => '💞'],
    ],

    // Room 2 — this photo gets cut into a 3×3 puzzle (square works best).
    'puzzle_photo' => 'media/propose/puzzle.jpg',

    // Room 3 — notes on the wall.
    'notes' => [
        'You always know when something is off',
        'The way you look at me when I am not looking',
        'How you laugh at my worst jokes',
        'You make every place feel like home',
        'The way you hold my hand like you mean it',
    ],

    // Room 4 — the letter. Blank lines become paragraphs.
    'letter' => <<<'TXT'
Hey love ❤️

I don't think I tell you this enough, but meeting you has been the best thing that has ever happened to me.

Thank you for being patient with me, for making me laugh, for listening to my endless talks, and for loving me even on the days I'm difficult.

No matter how busy life gets, I want you to remember one thing… you will always be my favourite person.

I love you more than words can ever explain.
TXT,

    // Room 5 — promises she ticks off.
    'promises' => [
        'Never go to bed angry',
        'Say the hard thing, gently',
        'Always share the last bite',
        'Choose you again, every ordinary morning',
        'Pick you first. Every time.',
    ],

];
