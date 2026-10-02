<?php

// Dumps config/birthday.php as JSON for the static (GitHub Pages) build —
// the same props BirthdayController passes, without booting Laravel, so it
// runs anywhere PHP does (CI included, no vendor/ needed). Media paths stay
// relative so the page works from any sub-path (e.g. user.github.io/repo/).

$root = dirname(__DIR__);

function env($key, $default = null)
{
    $value = getenv($key);

    return $value === false ? $default : $value;
}

$c = require $root.'/config/birthday.php';

$media = function (?string $path) use ($root) {
    return $path && is_file($root.'/public/'.$path) ? $path : null;
};

echo json_encode([
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
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
