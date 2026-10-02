import { useEffect, useState } from 'react';

const SPOTS = [
    { x: -150, y: -150, r: -6 },
    { x: 130, y: -140, r: 5 },
    { x: -120, y: 120, r: 4 },
    { x: 150, y: 110, r: -5 },
];
const PH = ['#F6C1CF', '#F3D2B0', '#E8D8F2', '#CDE8D6'];

function Shot({ g, i }) {
    const [failed, setFailed] = useState(!g?.photo);
    // Shrink the spread on short screens so the top photos stay visible.
    const k = Math.min(1, innerHeight / 820, innerWidth / 520);
    const s = SPOTS[i];
    return (
        <div className="pr-shot" style={{ '--x': `${s.x * k}px`, '--y': `${s.y * k}px`, '--r': `${s.r}deg`, '--i': i }}>
            {failed ? (
                <div className="pr-shot-ph" style={{ background: PH[i % 4] }}>{g?.emoji ?? '📸'}</div>
            ) : (
                <img src={g.photo} alt="" onError={() => setFailed(true)} />
            )}
        </div>
    );
}

// Scene 3 — your photos land on the table one by one, then the invitation.
export default function Polaroids({ from, gallery, next }) {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setReady(true), 2200);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className={`pr-polaroids ${ready ? 'is-ready' : ''}`} onClick={() => ready && next()}>
            <div className="pr-table">
                {SPOTS.map((_, i) => (
                    <Shot key={i} g={gallery[i % Math.max(1, gallery.length)]} i={i} />
                ))}
            </div>
            <div className="pr-invite">
                <h2 className="pr-script pr-invite-title">See what {from} built for you</h2>
                <span className="pr-tap-hand">👆</span>
                <p className="pr-hand">tap anywhere to go in</p>
            </div>
        </div>
    );
}
