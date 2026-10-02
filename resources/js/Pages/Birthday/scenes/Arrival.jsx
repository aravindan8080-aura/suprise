import { useRef, useState } from 'react';
import { sfx, start } from '../lib/audio';
import { confettiBurst, sparkle } from '../lib/fx';

// Scene 1 — a glass gift tag. "Unwrap it" starts the music (the first user
// gesture), shakes the gift, bursts it open and moves on.
export default function Arrival({ to, from, music, next }) {
    const giftRef = useRef(null);
    const [state, setState] = useState('idle'); // idle → shaking → open

    const unwrap = () => {
        if (state !== 'idle') return;
        start(music);
        setState('shaking');
        setTimeout(() => {
            const r = giftRef.current.getBoundingClientRect();
            const x = r.left + r.width / 2;
            const y = r.top + r.height / 2;
            setState('open');
            sfx.pop();
            sfx.chime();
            confettiBurst(x, y, 160, { power: 14 });
            sparkle(x, y, 40);
            setTimeout(next, 1100);
        }, 900);
    };

    return (
        <div className={`bd-arrival is-${state}`}>
            <div className="bd-tag bd-rise" style={{ '--d': '0.1s' }}>
                <span className="bd-tag-hole" />
                <span className="bd-tag-sheen" />
                <div className="bd-gift-wrap" ref={giftRef}>
                    <div className="bd-gift-glow" />
                    <span className="bd-gift">🎁</span>
                </div>
                <p className="bd-eyebrow bd-rise" style={{ '--d': '0.35s' }}>A surprise for</p>
                <h1 className="bd-script bd-tag-name bd-rise" style={{ '--d': '0.5s' }}>{to}</h1>
                <p className="bd-tag-sub bd-rise" style={{ '--d': '0.65s' }}>{from} made this — just for you.</p>
            </div>

            <button type="button" className="bd-btn bd-rise" style={{ '--d': '0.85s' }} onClick={unwrap}>
                Unwrap it <span className="bd-btn-emoji">✨</span>
            </button>
            <p className="bd-hint bd-rise" style={{ '--d': '1s' }}>🔊 Sound on for the full magic</p>
        </div>
    );
}
