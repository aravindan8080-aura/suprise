<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class BirthdayController extends Controller
{
    /**
     * The whole surprise is one static page — every scene's content comes
     * from config/birthday.php, with file paths resolved to public URLs
     * here so the page works from any base URL (artisan serve or XAMPP).
     */
    public function index(): Response
    {
        $c = config('birthday');

        return Inertia::render('Birthday/Index', [
            'to' => $c['to'],
            'from' => $c['from'],
            'age' => $c['age'],
            'togetherSince' => $c['together_since'],
            'music' => $this->publicUrl($c['music'] ?? null),
            'reasons' => array_values($c['reasons'] ?? []),
            'memories' => collect($c['memories'] ?? [])->map(fn ($m) => [
                'photo' => $this->publicUrl($m['photo'] ?? null),
                'caption' => $m['caption'] ?? '',
                'emoji' => $m['emoji'] ?? '📸',
            ])->values(),
            'letter' => trim($c['letter'] ?? ''),
            'sticker' => $this->publicUrl($c['sticker'] ?? null),
        ]);
    }

    /**
     * The best-friend version — same idea, playful theme, content from
     * config/friend.php.
     */
    public function friend(): Response
    {
        $c = config('friend');

        return Inertia::render('Friend/Index', [
            'to' => $c['to'],
            'from' => $c['from'],
            'age' => $c['age'],
            'friendsSince' => $c['friends_since'],
            'music' => $this->publicUrl($c['music'] ?? null),
            'scratch' => array_values($c['scratch'] ?? []),
            'photos' => collect($c['photos'] ?? [])->map(fn ($p) => [
                'photo' => $this->publicUrl($p['photo'] ?? null),
                'caption' => $p['caption'] ?? '',
                'emoji' => $p['emoji'] ?? '📸',
            ])->values(),
            'chat' => array_values($c['chat'] ?? []),
            'sticker' => $this->publicUrl($c['sticker'] ?? null),
        ]);
    }

    /**
     * URL for a file under public/, or null when it doesn't exist so the
     * page can fall back (synth music, placeholder polaroid, emoji sticker).
     */
    private function publicUrl(?string $path): ?string
    {
        if (! $path || ! is_file(public_path($path))) {
            return null;
        }

        return asset($path);
    }
}
