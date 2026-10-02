import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';

const PLACEHOLDER_GRADS = [
    'linear-gradient(135deg,#FFB3CF,#FF7BAC)',
    'linear-gradient(135deg,#FFD59E,#FF8A5B)',
    'linear-gradient(135deg,#C4B5FD,#8B5CF6)',
    'linear-gradient(135deg,#99F6E4,#14B8A6)',
    'linear-gradient(135deg,#FECACA,#F472B6)',
];

function Photo({ m, i, active }) {
    const [failed, setFailed] = useState(!m.photo);
    return (
        <div className="bd-photo-frame">
            {failed ? (
                <div className="bd-photo-ph" style={{ background: PLACEHOLDER_GRADS[i % PLACEHOLDER_GRADS.length] }}>
                    <span className="bd-photo-ph-emoji">{m.emoji}</span>
                    <span className="bd-photo-ph-note">add photo {i + 1}.jpg</span>
                </div>
            ) : (
                <img src={m.photo} alt="" draggable="false" className={active ? 'is-active' : ''} onError={() => setFailed(true)} />
            )}
        </div>
    );
}

// Scene 6 — a swipeable string of polaroids under fairy lights.
export default function Memories({ memories, next }) {
    const [index, setIndex] = useState(0);
    const [drag, setDrag] = useState(0);
    const [seen, setSeen] = useState(() => new Set([0]));
    const start = useRef(null);
    const count = memories.length;

    const goTo = (i) => {
        const n = Math.max(0, Math.min(count - 1, i));
        if (n !== index) sfx.tick();
        setIndex(n);
        setSeen((s) => new Set(s).add(n));
    };

    useEffect(() => {
        const key = (e) => {
            if (e.key === 'ArrowRight') goTo(index + 1);
            if (e.key === 'ArrowLeft') goTo(index - 1);
        };
        window.addEventListener('keydown', key);
        return () => window.removeEventListener('keydown', key);
    });

    const onDown = (e) => {
        start.current = e.clientX;
        e.currentTarget.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e) => start.current !== null && setDrag(e.clientX - start.current);
    const onUp = () => {
        if (start.current === null) return;
        if (drag < -50) goTo(index + 1);
        else if (drag > 50) goTo(index - 1);
        else if (Math.abs(drag) < 5) goTo(index + 1 >= count ? 0 : index + 1); // tap = next
        start.current = null;
        setDrag(0);
    };

    const allSeen = seen.size >= count;
    const bulbs = 9;

    return (
        <div className="bd-memories">
            <h2 className="bd-step-title bd-rise" style={{ '--d': '0.1s' }}>A walk down memory lane</h2>
            <p className="bd-step-sub bd-rise" style={{ '--d': '0.25s' }}>swipe through 📸</p>

            <div className="bd-lights bd-rise" style={{ '--d': '0.35s' }}>
                <svg viewBox="0 0 500 40" preserveAspectRatio="none" className="bd-lights-wire">
                    <path d="M0 6 Q 250 34 500 6" />
                </svg>
                {Array.from({ length: bulbs }, (_, i) => {
                    const x = i / (bulbs - 1);
                    const y = 6 + 28 * 4 * x * (1 - x) * 0.5; // follows the wire's sag
                    return <span key={i} className="bd-bulb" style={{ left: `${x * 100}%`, top: `${y}px`, '--i': i }} />;
                })}
            </div>

            <div
                className="bd-carousel bd-rise"
                style={{ '--d': '0.45s' }}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
            >
                {memories.map((m, i) => {
                    const off = i - index;
                    const dragShift = drag / 300;
                    const pos = off + dragShift;
                    const abs = Math.abs(pos);
                    return (
                        <div
                            key={i}
                            className={`bd-polaroid ${off === 0 ? 'is-active' : ''} ${start.current !== null ? 'is-dragging' : ''}`}
                            style={{
                                transform: `translateX(calc(-50% + ${pos * 62}%)) translateY(${abs * 18}px) rotate(${(i % 2 ? 3 : -3) + pos * 4}deg) scale(${1 - Math.min(abs, 2) * 0.12})`,
                                zIndex: 10 - Math.round(abs),
                                opacity: abs > 2.2 ? 0 : 1 - Math.min(abs, 2) * 0.25,
                            }}
                        >
                            {off === 0 && <span className="bd-clip" />}
                            <Photo m={m} i={i} active={off === 0} />
                            <p className="bd-photo-cap">{m.caption}</p>
                        </div>
                    );
                })}
            </div>

            <div className="bd-dots">
                {memories.map((_, i) => (
                    <button type="button" key={i} className={`bd-dot ${i === index ? 'is-on' : ''}`} onClick={() => goTo(i)} aria-label={`Photo ${i + 1}`} />
                ))}
            </div>

            <button type="button" className={`bd-btn ${allSeen ? 'is-ready' : 'is-quiet'}`} onClick={next}>
                Keep going <span className="bd-btn-emoji">✨</span>
            </button>
        </div>
    );
}
