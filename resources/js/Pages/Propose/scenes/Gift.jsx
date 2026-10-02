import { useEffect, useMemo, useState } from 'react';
import { sfx, start } from '../../Birthday/lib/audio';
import { sparkle } from '../../Birthday/lib/fx';

const ROSE_COLORS = [
    ['#F6A5BD', '#D9567C'],
    ['#EBA27E', '#C2603A'],
    ['#F7F1DE', '#CBBF95'],
];

export function Rose({ colors, size }) {
    const [base, dark] = colors;
    // A spiral for the heart of the rose.
    const spiral = useMemo(() => {
        let d = '';
        for (let t = 0; t <= 1; t += 0.02) {
            const r = 3 + t * 30;
            const a = t * Math.PI * 7;
            d += `${t ? 'L' : 'M'} ${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)} `;
        }
        return d;
    }, []);
    return (
        <svg viewBox="-50 -50 100 100" width={size} height={size}>
            {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="0" cy="-26" rx="22" ry="20" fill={base} stroke={dark} strokeOpacity=".35" strokeWidth="2" transform={`rotate(${a})`} />
            ))}
            <circle r="32" fill={base} />
            <path d={spiral} fill="none" stroke={dark} strokeWidth="3.4" strokeLinecap="round" opacity=".75" />
            <ellipse cx="-12" cy="-14" rx="10" ry="6" fill="#fff" opacity=".35" transform="rotate(-30 -12 -14)" />
        </svg>
    );
}

function SketchGift({ seed }) {
    return (
        <svg viewBox="0 0 240 240" className="pr-gift-svg">
            <defs>
                <filter id="prSketch">
                    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={seed} result="n" />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="5" />
                </filter>
                <pattern id="prHatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
                    <rect width="7" height="7" fill="#F7B6C8" />
                    <line x1="0" y1="0" x2="0" y2="7" stroke="#E0436F" strokeWidth="2.2" opacity=".75" />
                </pattern>
                <pattern id="prHatch2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(55)">
                    <rect width="6" height="6" fill="#F28BA8" />
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#B8234F" strokeWidth="2" opacity=".7" />
                </pattern>
            </defs>
            <g filter="url(#prSketch)" stroke="#2A1A1F" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
                {/* box */}
                <rect x="46" y="112" width="148" height="112" fill="url(#prHatch)" />
                <rect x="108" y="112" width="24" height="112" fill="url(#prHatch2)" />
                {/* lid */}
                <g className="pr-gift-lid">
                    <rect x="36" y="82" width="168" height="36" fill="url(#prHatch)" />
                    <rect x="108" y="82" width="24" height="36" fill="url(#prHatch2)" />
                    <path d="M120 82 C 92 40, 58 52, 72 74 C 82 88, 108 86, 120 82 Z" fill="url(#prHatch2)" />
                    <path d="M120 82 C 148 40, 182 52, 168 74 C 158 88, 132 86, 120 82 Z" fill="url(#prHatch2)" />
                    <path d="M120 82 L 102 112 M120 82 L 140 112" fill="none" />
                    <ellipse cx="120" cy="80" rx="12" ry="10" fill="url(#prHatch2)" />
                </g>
            </g>
        </svg>
    );
}

// Scene 1 — a hand-drawn gift. Tapping it starts the music, pops the lid
// and floods the screen with roses.
export default function Gift({ to, music, next }) {
    const [seed, setSeed] = useState(1);
    const [phase, setPhase] = useState('closed'); // closed → open → roses

    // "Boiling line" — redraw the sketch filter a few times a second.
    useEffect(() => {
        const id = setInterval(() => setSeed((s) => (s % 3) + 1), 160);
        return () => clearInterval(id);
    }, []);

    const roses = useMemo(() => {
        const out = [];
        const cell = 120;
        const cols = Math.ceil(innerWidth / cell) + 1;
        const rows = Math.ceil(innerHeight / cell) + 1;
        const cx = innerWidth / 2;
        const cy = innerHeight / 2;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                for (let k = 0; k < 2; k++) {
                    const x = c * cell + (Math.random() - 0.5) * cell + (k ? cell / 2 : 0);
                    const y = r * cell + (Math.random() - 0.5) * cell + (k ? cell / 2 : 0);
                    out.push({
                        x, y,
                        size: 110 + Math.random() * 80,
                        rot: Math.random() * 360,
                        colors: ROSE_COLORS[(Math.random() * 3) | 0],
                        delay: Math.hypot(x - cx, y - cy) / 1400 + Math.random() * 0.12,
                    });
                }
            }
        }
        return out;
    }, []);

    const open = (e) => {
        if (phase !== 'closed') return;
        start(music, { beat: 0.7 });
        setPhase('open');
        sfx.pop();
        sparkle(e.clientX, e.clientY, 30, '#F6A5BD');
        setTimeout(() => {
            setPhase('roses');
            sfx.whoosh();
            sfx.chime();
        }, 700);
        setTimeout(next, 2600);
    };

    return (
        <div className={`pr-gift-scene is-${phase}`} onClick={open}>
            <div className="pr-gift-wrap">
                <div className="pr-gift-glow" />
                <SketchGift seed={seed} />
            </div>
            <h1 className="pr-script pr-gift-title bd-rise" style={{ '--d': '0.4s' }}>For you, {to}.</h1>
            <p className="pr-hand pr-gift-hint bd-rise" style={{ '--d': '0.8s' }}>(tap to open)</p>

            {phase === 'roses' && (
                <div className="pr-rose-flood" aria-hidden="true">
                    {roses.map((r, i) => (
                        <span key={i} className="pr-rose" style={{ left: r.x, top: r.y, '--rot': `${r.rot}deg`, '--d': `${r.delay}s` }}>
                            <Rose colors={r.colors} size={r.size} />
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
