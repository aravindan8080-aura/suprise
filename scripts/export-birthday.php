<?php

// Dumps a page's config as JSON for the static (GitHub Pages) build — the
// same props BirthdayController passes, without booting Laravel, so it runs
// anywhere PHP does (CI included, no vendor/ needed).
//
//   php scripts/export-birthday.php            → config/birthday.php
//   php scripts/export-birthday.php friend     → config/friend.php
//   php scripts/export-birthday.php propose    → config/propose.php
//
// Media paths stay relative; the other pages live one folder down
// (/friend/, /propose/), so their paths get a "../" prefix.

$root = dirname(__DIR__);
$page = $argv[1] ?? 'birthday';

function env($key, $default = null)
{
    $value = getenv($key);

    return $value === false ? $default : $value;
}

$prefix = $page === 'birthday' ? '' : '../';
$media = function (?string $path) use ($root, $prefix) {
    return $path && is_file($root.'/public/'.$path) ? $prefix.$path : null;
};

if ($page === 'propose') {
    $c = require $root.'/config/propose.php';
    $data = [
        'to' => $c['to'],
        'from' => $c['from'],
        'question' => $c['question'],
        'music' => $media($c['music'] ?? null),
        'couplePhoto' => $media($c['couple_photo'] ?? null),
        'quote' => array_values($c['quote'] ?? []),
        'gallery' => array_map(fn ($g) => [
            'photo' => $media($g['photo'] ?? null),
            'title' => $g['title'] ?? '',
            'emoji' => $g['emoji'] ?? '📸',
        ], array_values($c['gallery'] ?? [])),
        'puzzlePhoto' => $media($c['puzzle_photo'] ?? null),
        'notes' => array_values($c['notes'] ?? []),
        'letter' => trim($c['letter'] ?? ''),
        'promises' => array_values($c['promises'] ?? []),
    ];
} elseif ($page === 'friend') {
    $c = require $root.'/config/friend.php';
    $data = [
        'to' => $c['to'],
        'from' => $c['from'],
        'age' => $c['age'],
        'friendsSince' => $c['friends_since'],
        'music' => $media($c['music'] ?? null),
        'scratch' => array_values($c['scratch'] ?? []),
        'photos' => array_map(fn ($p) => [
            'photo' => $media($p['photo'] ?? null),
            'caption' => $p['caption'] ?? '',
            'emoji' => $p['emoji'] ?? '📸',
        ], array_values($c['photos'] ?? [])),
        'chat' => array_values($c['chat'] ?? []),
        'sticker' => $media($c['sticker'] ?? null),
    ];
} else {
    $c = require $root.'/config/birthday.php';
    $data = [
        'to' => $c['to'],
        'from' => $c['from'],
        'age' => $c['age'],
        'togetherSince' => $c['together_since'],
        'music' => $media($c['music'] ?? null),
        'reasons' => array_values($c['reasons'] ?? []),
        'memories' => array_map(fn ($m) => [
            'photo' => $media($m['photo'] ?? null),
            'caption' => $m['caption'] ?? '',
            'emoji' => $m['emoji'] ?? '📸',
        ], array_values($c['memories'] ?? [])),
        'letter' => trim($c['letter'] ?? ''),
        'sticker' => $media($c['sticker'] ?? null),
    ];
}

echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
