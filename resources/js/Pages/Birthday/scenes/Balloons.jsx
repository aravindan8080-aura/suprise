import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';
import { bits, confettiBurst } from '../lib/fx';

const COLORS = ['#FF8FB1', '#F6C453', '#A78BFA', '#39D0C4', '#FF7A59', '#7DD3FC'];

// Scene 5 — every balloon hides a reason she's loved.
export default function Balloons({ reasons, next }) {
    const [popped, setPopped] = useState([]); // indexes in pop order
    const [popping, setPopping] = useState(null);
    const done = popped.length === reasons.length;
    const listRef = useRef(null);

    // Bring each newly revealed reason (and finally the button) into view.
    useEffect(() => {
        const last = listRef.current?.lastElementChild;
        if (!last) return;
        const t = setTimeout(() => (done ? listRef.current.nextElementSibling ?? last : last).scrollIntoView({ behavior: 'smooth', block: 'nearest' }), done ? 700 : 150);
        return () => clearTimeout(t);
    }, [popped.length, done]);

    const pop = (i, e) => {
        if (popped.includes(i) || popping !== null) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height * 0.38;
        setPopping(i);
        sfx.pop();
        bits(x, y, COLORS[i % COLORS.length], 26);
        setTimeout(() => {
            setPopping(null);
            setPopped((p) => {
                const n = [...p, i];
                if (n.length === reasons.length) {
                    sfx.chime();
                    confettiBurst(innerWidth / 2, innerHeight * 0.35, 90, { power: 12 });
                }
                return n;
            });
        }, 260);
    };

    return (
        <div className="bd-balloons">
            <h2 className="bd-step-title bd-rise" style={{ '--d': '0.1s' }}>Pop the balloons 🎈</h2>
            <p className="bd-step-sub bd-rise" style={{ '--d': '0.25s' }}>
                {reasons.length} balloons. Each one holds a reason you're loved. Pop them all 🎈
            </p>

            <div className={`bd-balloon-field ${done ? 'is-empty' : ''}`}>
                {reasons.map((_, i) => {
                    const color = COLORS[i % COLORS.length];
                    const isGone = popped.includes(i);
                    const spread = reasons.length > 1 ? i / (reasons.length - 1) : 0.5;
                    return (
                        <button
                            type="button"
                            key={i}
                            className={`bd-balloon ${popping === i ? 'is-popping' : ''} ${isGone ? 'is-gone' : ''}`}
                            style={{
                                '--c': color,
                                '--i': i,
                                left: `${8 + spread * 84}%`,
                                top: `${(i % 2) * 34 + (i % 3) * 6}px`,
                            }}
                            onClick={(e) => pop(i, e)}
                            aria-label={`Pop balloon ${i + 1}`}
                        >
                            <span className="bd-balloon-bob">
                                <span className="bd-balloon-body" />
                                <span className="bd-balloon-knot" />
                                <svg className="bd-balloon-string" viewBox="0 0 20 120" preserveAspectRatio="none">
                                    <path d="M10 0 Q 2 20 10 40 T 10 80 T 10 120" />
                                </svg>
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="bd-reasons" ref={listRef}>
                {popped.map((i, n) => (
                    <div key={i} className="bd-reason-card" style={{ '--c': COLORS[i % COLORS.length] }}>
                        <div className="bd-reason-sheen" />
                        <span className="bd-reason-badge">Reason no.{n + 1} 💖</span>
                        <p className="bd-reason-text">{reasons[i]}</p>
                        <span className="bd-reason-spark">✨</span>
                    </div>
                ))}
            </div>

            {done && (
                <button type="button" className="bd-btn bd-rise" style={{ '--d': '0.3s' }} onClick={next}>
                    Keep going <span className="bd-btn-emoji">✨</span>
                </button>
            )}
        </div>
    );
}
