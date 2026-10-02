import '../../../css/friend.css';

import { useCallback, useEffect, useState } from 'react';
import SoundToggle from '../Birthday/lib/SoundToggle';
import { clearFx } from '../Birthday/lib/fx';
import Backdrop from './Backdrop';
import Ticket from './scenes/Ticket';
import Meter from './scenes/Meter';
import Pinata from './scenes/Pinata';
import Scratch from './scenes/Scratch';
import Booth from './scenes/Booth';
import Chat from './scenes/Chat';
import Finale from './scenes/Finale';

// The best-friend surprise: a playful, comic-book take on the same idea.
const SCENES = [
    { key: 'ticket', C: Ticket },
    { key: 'meter', C: Meter },
    { key: 'pinata', C: Pinata },
    { key: 'scratch', C: Scratch },
    { key: 'booth', C: Booth },
    { key: 'chat', C: Chat },
    { key: 'finale', C: Finale },
];

const LEAVE_MS = 600;

export default function FriendIndex(props) {
    // ?scene=chat (etc.) jumps straight to a scene — handy for previewing edits.
    const [index, setIndex] = useState(() => {
        const s = new URLSearchParams(window.location.search).get('scene');
        return Math.max(0, SCENES.findIndex((x) => x.key === s));
    });
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        document.title = `🎉 ${props.to}'s birthday party`;
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
    const replay = useCallback(() => go(1), [go]);

    const scene = SCENES[index];
    const Scene = scene.C;

    return (
        <div className="fr-root">
            <Backdrop />
            <SoundToggle />
            <main key={scene.key} className={`bd-scene fr-scene fr-scene--${scene.key} ${leaving ? 'is-leaving' : ''}`}>
                <Scene {...props} next={next} replay={replay} />
            </main>
        </div>
    );
}
