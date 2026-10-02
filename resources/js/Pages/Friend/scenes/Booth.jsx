import { useEffect, useState } from 'react';
import { sfx } from '../../Birthday/lib/audio';

const PH = ['#FFD23F', '#3BCEAC', '#FF8C42', '#B388FF', '#5B8CFF', '#EE4266'];

function Frame({ p, i }) {
    const [failed, setFailed] = useState(!p.photo);
    return (
        <div className="fr-booth-frame" style={{ '--i': i }}>
            <div className="fr-booth-photo">
                {failed ? (
                    <div className="fr-booth-ph" style={{ background: PH[i % PH.length] }}>
                        <span>{p.emoji}</span>
                    </div>
                ) : (
                    <img src={p.photo} alt="" onError={() => setFailed(true)} />
                )}
            </div>
            <p className="fr-booth-cap">{p.caption}</p>
        </div>
    );
}

// Scene 5 — a photo-booth strip prints out one shot at a time, each with
// a camera flash, and the photos "develop" from overexposed white.
export default function Booth({ photos, next }) {
    const [printed, setPrinted] = useState(0);
    const [flash, setFlash] = useState(0);
    const done = printed >= photos.length;

    // Follow the strip as it grows, then bring the button into view.
    useEffect(() => {
        if (!printed) return;
        const t = setTimeout(() => {
            const el = done ? document.querySelector('.fr-booth-scene > .fr-btn') : document.querySelector('.fr-booth-frame:last-child');
            el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 350);
        return () => clearTimeout(t);
    }, [printed, done]);

    useEffect(() => {
        if (done) return;
        const t = setTimeout(() => {
            setFlash((f) => f + 1);
            sfx.pop();
            setPrinted((n) => n + 1);
        }, printed === 0 ? 1300 : 1100);
        return () => clearTimeout(t);
    }, [printed, done]);

    return (
        <div className="fr-booth-scene">
            <h2 className="fr-title bd-rise" style={{ '--d': '0.1s' }}>Photo booth 📸</h2>
            <p className="fr-sub bd-rise" style={{ '--d': '0.25s' }}>Evidence of our friendship (handle with care)</p>

            <div className="fr-booth bd-rise" style={{ '--d': '0.4s' }}>
                <div className="fr-booth-head">
                    <span className="fr-booth-neon">PHOTO BOOTH</span>
                    <span className={`fr-booth-light ${done ? '' : 'is-on'}`} />
                </div>
                <div className="fr-booth-slot" />
                <div className="fr-strip">
                    {photos.slice(0, printed).map((p, i) => (
                        <Frame key={i} p={p} i={i} />
                    ))}
                    {done && <p className="fr-strip-foot">best friends · est. forever</p>}
                </div>
            </div>

            {flash > 0 && <div key={flash} className="fr-flash" />}

            <button type="button" className={`fr-btn ${done ? 'bd-rise' : 'is-quiet'}`} onClick={next}>
                {done ? 'Keep going ➜' : 'printing… (skip ➜)'}
            </button>
        </div>
    );
}
