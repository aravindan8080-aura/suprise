import { useCallback, useEffect, useState } from 'react';
import Backdrop from './lib/Backdrop';
import SoundToggle from './lib/SoundToggle';
import { clearFx } from './lib/fx';
import Arrival from './scenes/Arrival';
import Arrow from './scenes/Arrow';
import Tree from './scenes/Tree';
import Cake from './scenes/Cake';
import Balloons from './scenes/Balloons';
import Memories from './scenes/Memories';
import Envelope from './scenes/Envelope';
import Letter from './scenes/Letter';
import Finale from './scenes/Finale';

// The surprise is a linear story — each scene calls next() when it's done.
const SCENES = [
    { key: 'arrival', C: Arrival },
    { key: 'arrow', C: Arrow, light: true },
    { key: 'tree', C: Tree, light: true },
    { key: 'cake', C: Cake },
    { key: 'balloons', C: Balloons },
    { key: 'memories', C: Memories },
    { key: 'envelope', C: Envelope },
    { key: 'letter', C: Letter },
    { key: 'finale', C: Finale },
];

const LEAVE_MS = 650;

export default function BirthdayIndex(props) {
    // ?scene=letter (etc.) jumps straight to a scene — handy for previewing edits.
    const [index, setIndex] = useState(() => {
        const s = new URLSearchParams(window.location.search).get('scene');
        return Math.max(0, SCENES.findIndex((x) => x.key === s));
    });
    const [leaving, setLeaving] = useState(false);

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

    // Plain document.title (not Inertia <Head>) so the same component also
    // runs in the static GitHub Pages build.
    useEffect(() => {
        document.title = `🎁 For ${props.to} — a birthday surprise`;
    }, [props.to]);

    const scene = SCENES[index];
    const Scene = scene.C;

    return (
        <>
            <Backdrop light={scene.light} />
            <SoundToggle light={scene.light} />
            <main key={scene.key} className={`bd-scene bd-scene--${scene.key} ${scene.light ? 'is-light' : ''} ${leaving ? 'is-leaving' : ''}`}>
                <Scene {...props} next={next} replay={replay} />
            </main>
        </>
    );
}
