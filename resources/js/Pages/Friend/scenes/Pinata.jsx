import { useRef, useState } from 'react';
import { sfx } from '../../Birthday/lib/audio';
import { confettiBurst, confettiRain, emojiBurst } from '../../Birthday/lib/fx';

const HITS = 5;
const CANDY = ['🍬', '🍭', '🍫', '🧁', '🍩', '🎁', '⭐', '🎈'];
const POWS = ['POW!', 'BAM!', 'WHACK!', 'BOOM!', 'KAPOW!'];

// Five-point star, centred at (100, 108).
const STAR = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 36 : 82;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${100 + r * Math.cos(a)},${108 + r * Math.sin(a)}`;
}).join(' ');

function StarPinata({ cracks }) {
    return (
        <svg viewBox="0 0 200 200" className="fr-pinata-svg">
            <defs>
                <pattern id="frFringe" width="200" height="22" patternUnits="userSpaceOnUse">
                    <rect width="200" height="11" fill="#FF5DA2" />
                    <rect y="11" width="200" height="11" fill="#FFD23F" />
                </pattern>
                <pattern id="frFringe2" width="22" height="200" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                    <rect width="11" height="200" fill="rgba(255,255,255,.18)" />
                </pattern>
                <clipPath id="frStarClip">
                    <polygon points={STAR} />
                </clipPath>
            </defs>
            <polygon points={STAR} fill="url(#frFringe)" stroke="#1B1035" strokeWidth="5" strokeLinejoin="round" />
            <g clipPath="url(#frStarClip)">
                <rect width="200" height="200" fill="url(#frFringe2)" />
                <circle cx="100" cy="112" r="26" fill="#3BCEAC" stroke="#1B1035" strokeWidth="4" />
                <text x="100" y="121" textAnchor="middle" className="fr-pinata-face">🎂</text>
                <g className="fr-pinata-cracks" style={{ opacity: Math.min(1, cracks / (HITS - 1)) }}>
                    <path d="M 100 30 l -8 22 l 10 10 l -12 20" />
                    <path d="M 40 90 l 22 6 l 6 14 l 18 2" />
                    <path d="M 160 92 l -20 10 l 4 16 l -16 8" />
                    <path d="M 70 170 l 10 -20 l 16 -4" />
                </g>
            </g>
            {/* tassels on the points */}
            {[0, 2, 4, 6, 8].map((i) => {
                const a = -Math.PI / 2 + (i * Math.PI) / 5;
                const x = 100 + 82 * Math.cos(a);
                const y = 108 + 82 * Math.sin(a);
                return i === 0 ? null : (
                    <g key={i} className="fr-tassel" style={{ transformOrigin: `${x}px ${y}px` }}>
                        <path d={`M ${x} ${y} l -5 16 M ${x} ${y} l 0 18 M ${x} ${y} l 5 16`} stroke={i % 4 ? '#3BCEAC' : '#5B8CFF'} strokeWidth="3" strokeLinecap="round" />
                    </g>
                );
            })}
        </svg>
    );
}

// Scene 3 — whack the piñata until it bursts and the birthday is revealed.
export default function Pinata({ to, age, next }) {
    const [hits, setHits] = useState(0);
    const [pows, setPows] = useState([]);
    const [swingKey, setSwingKey] = useState(0);
    const rigRef = useRef(null);
    const broken = hits >= HITS;

    const whack = (e) => {
        if (broken) return;
        const n = hits + 1;
        const x = e.clientX;
        const y = e.clientY;
        setHits(n);
        setSwingKey((k) => k + 1);
        setPows((p) => [...p.slice(-3), { id: Date.now(), x, y, text: POWS[(n - 1) % POWS.length], rot: Math.random() * 30 - 15 }]);
        sfx.thunk();
        if (navigator.vibrate) navigator.vibrate(30);

        const r = rigRef.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.6;
        if (n < HITS) {
            emojiBurst(cx, cy, CANDY, 3 + n, 6);
            return;
        }
        // The big one.
        setTimeout(() => {
            sfx.pop();
            sfx.firework();
            sfx.chime();
            emojiBurst(cx, cy, CANDY, 46, 15);
            confettiBurst(cx, cy, 160, { power: 15 });
            confettiRain(4000, 2);
        }, 120);
    };

    return (
        <div className={`fr-pinata-scene ${broken ? 'is-broken' : ''}`}>
            {!broken ? (
                <>
                    <h2 className="fr-title bd-rise" style={{ '--d': '0.1s' }}>Whack the piñata! 💥</h2>
                    <p className="fr-sub bd-rise" style={{ '--d': '0.25s' }}>Tap it {HITS} times — something's inside 👀</p>
                </>
            ) : (
                <div className="fr-reveal">
                    <h1 className="fr-reveal-title">
                        {'HAPPY BIRTHDAY'.split('').map((ch, i) => (
                            <span key={i} className="fr-wave" style={{ '--i': i }}>{ch === ' ' ? ' ' : ch}</span>
                        ))}
                    </h1>
                    <p className="fr-reveal-name">{to}!</p>
                    <div className="fr-level">
                        <span className="fr-level-icon">🎮</span>
                        <span>
                            LEVEL <b>{age}</b> UNLOCKED
                        </span>
                    </div>
                    <p className="fr-sub fr-level-sub">New perks: more wisdom (doubtful), same old chaos (guaranteed).</p>
                    <button type="button" className="fr-btn" onClick={next}>
                        Next level ➜
                    </button>
                </div>
            )}

            <div className="fr-pinata-stage" onClick={whack}>
                <div className="fr-rope" />
                <div ref={rigRef} key={swingKey} className={`fr-pinata-rig ${hits ? 'is-hit' : ''}`} style={{ '--force': Math.min(hits, 4) }}>
                    {!broken ? (
                        <StarPinata cracks={hits} />
                    ) : (
                        <>
                            <div className="fr-half fr-half-l"><StarPinata cracks={HITS} /></div>
                            <div className="fr-half fr-half-r"><StarPinata cracks={HITS} /></div>
                        </>
                    )}
                </div>
                {!broken && (
                    <div className="fr-hits">
                        {Array.from({ length: HITS }, (_, i) => (
                            <span key={i} className={i < hits ? 'is-on' : ''} />
                        ))}
                    </div>
                )}
            </div>

            {pows.map((p) => (
                <span key={p.id} className="fr-pow" style={{ left: p.x, top: p.y, '--rot': `${p.rot}deg` }}>
                    {p.text}
                </span>
            ))}
        </div>
    );
}
