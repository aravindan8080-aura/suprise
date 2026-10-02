import '../../../css/propose.css';

import { useCallback, useEffect, useState } from 'react';
import SoundToggle from '../Birthday/lib/SoundToggle';
import { clearFx } from '../Birthday/lib/fx';
import Gift from './scenes/Gift';
import Intro from './scenes/Intro';
import Polaroids from './scenes/Polaroids';
import Door from './scenes/Door';
import Gallery from './scenes/Gallery';
import Puzzle from './scenes/Puzzle';
import Notes from './scenes/Notes';
import Letter from './scenes/Letter';
import Promises from './scenes/Promises';
import Question from './scenes/Question';
import Finale from './scenes/Finale';

// The proposal: a gift, a love note, then a little "museum" of your story
// whose last room holds the question. `room` marks the museum rooms shown
// in the tracker.
const SCENES = [
    { key: 'gift', C: Gift },
    { key: 'intro', C: Intro },
    { key: 'polaroids', C: Polaroids },
    { key: 'door', C: Door, dark: true },
    { key: 'gallery', C: Gallery, room: { n: 1, name: 'The Gallery', icon: '🖼️' } },
    { key: 'puzzle', C: Puzzle, room: { n: 2, name: 'The Restoration Desk', icon: '🧩' } },
    { key: 'notes', C: Notes, room: { n: 3, name: 'The Note Wall', icon: '📝' } },
    { key: 'letter', C: Letter, room: { n: 4, name: 'The Reading Room', icon: '💌' } },
    { key: 'promises', C: Promises, room: { n: 5, name: 'The Promises', icon: '🤞' } },
    { key: 'question', C: Question, dark: true, room: { n: 6, name: 'The Last Room', icon: '💍' } },
    { key: 'finale', C: Finale },
];

export const ROOMS = SCENES.filter((s) => s.room).map((s) => s.room);
const LEAVE_MS = 650;

function Tracker({ current }) {
    return (
        <div className="pr-tracker" aria-label="Rooms visited">
            {ROOMS.map((r) => (
                <span key={r.n} className={`pr-track ${r.n < current ? 'is-done' : ''} ${r.n === current ? 'is-here' : ''}`} title={r.name}>
                    {r.icon}
                </span>
            ))}
        </div>
    );
}

export default function ProposeIndex(props) {
    // ?scene=puzzle (etc.) jumps straight to a scene — handy for previewing.
    const [index, setIndex] = useState(() => {
        const s = new URLSearchParams(window.location.search).get('scene');
        return Math.max(0, SCENES.findIndex((x) => x.key === s));
    });
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        document.title = `💌 For ${props.to}`;
    }, [props.to]);

    const go = useCallback((to) => {
        setLeaving(true);
        setTimeout(() => {
            clearFx();
            setIndex(to);
            setLeaving(false);
            window.scrollTo(0, 0);
        }, LEAVE_MS);
    }, []);

    const next = useCallback(() => go(Math.min(index + 1, SCENES.length - 1)), [go, index]);
    const replay = useCallback(() => go(0), [go]);

    const scene = SCENES[index];
    const Scene = scene.C;

    return (
        <div className={`pr-root ${scene.dark ? 'is-dark' : ''}`}>
            <div className="pr-backdrop" aria-hidden="true">
                <div className="pr-cream" />
                <div className="pr-night" />
                {Array.from({ length: 10 }, (_, i) => (
                    <span key={i} className="pr-petal" style={{ '--i': i, left: `${(i * 37 + 5) % 100}%` }} />
                ))}
            </div>
            <SoundToggle light={!scene.dark} />
            <main key={scene.key} className={`bd-scene pr-scene pr-scene--${scene.key} ${leaving ? 'is-leaving' : ''}`}>
                {scene.room && (
                    <p className="pr-room-label">
                        Room {scene.room.n} · {scene.room.name}
                    </p>
                )}
                <Scene {...props} next={next} replay={replay} />
                {scene.room && <Tracker current={scene.room.n} />}
            </main>
        </div>
    );
}
