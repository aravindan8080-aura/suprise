import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../Birthday/lib/audio';
import { confettiBurst, sparkle } from '../../Birthday/lib/fx';

const SEGMENTS = [
    { label: 'meh', color: '#5B8CFF' },
    { label: 'good', color: '#3BCEAC' },
    { label: 'great', color: '#FFD23F' },
    { label: 'bestie', color: '#FF8C42' },
    { label: 'family', color: '#EE4266' },
];

// [needle angle in degrees (-90 = far left, 90 = far right), ms to get there]
const SCAN = [
    [-50, 700], [-70, 350], [-10, 600], [-25, 300], [35, 600], [20, 280], [70, 600], [62, 250], [88, 500], [84, 200], [128, 260],
];

const R = 120;
const C = { x: 150, y: 150 };

function arcPath(a0, a1) {
    // Angles in degrees on the top half: 180 = left, 360 = right.
    const p = (a) => [C.x + R * Math.cos((a * Math.PI) / 180), C.y + R * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
}

const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

// Scene 2 — the official friendship-o-meter, which can't handle the result.
export default function Meter({ to, next }) {
    const [angle, setAngle] = useState(-90);
    const [phase, setPhase] = useState('idle'); // idle → scanning → overload
    const gaugeRef = useRef(null);
    const lastSeg = useRef(-1);

    const scan = () => {
        if (phase !== 'idle') return;
        setPhase('scanning');
        let from = -90;
        let i = 0;
        let t0 = performance.now();
        const step = (now) => {
            const [to, dur] = SCAN[i];
            const k = Math.min(1, (now - t0) / dur);
            const a = from + (to - from) * ease(k);
            setAngle(a);
            const seg = Math.floor((Math.min(a, 89.9) + 90) / 36);
            if (seg !== lastSeg.current) {
                lastSeg.current = seg;
                sfx.tick();
            }
            if (k < 1) return requestAnimationFrame(step);
            from = to;
            i++;
            t0 = now;
            if (i < SCAN.length) return requestAnimationFrame(step);
            overload();
        };
        requestAnimationFrame(step);
    };

    const overload = () => {
        setPhase('overload');
        sfx.firework();
        sfx.thunk();
        const r = gaugeRef.current.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height * 0.55;
        sparkle(x, y, 60, '#FFD23F');
        setTimeout(() => {
            sfx.chime();
            confettiBurst(x, y, 90, { power: 12 });
        }, 500);
    };

    // Auto-start shortly after arriving if they don't press the button.
    useEffect(() => {
        if (phase !== 'idle') return;
        const t = setTimeout(scan, 2600);
        return () => clearTimeout(t);
    }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

    const pct = Math.round(((Math.min(angle, 90) + 90) / 180) * 100);

    return (
        <div className={`fr-meter-scene is-${phase}`}>
            <h2 className="fr-title bd-rise" style={{ '--d': '0.1s' }}>Official friendship‑o‑meter 📟</h2>
            <p className="fr-sub bd-rise" style={{ '--d': '0.25s' }}>Measuring how good a friend {to} really is…</p>

            <div className="fr-gauge bd-rise" style={{ '--d': '0.4s' }} ref={gaugeRef}>
                <svg viewBox="0 0 300 175">
                    <path d={arcPath(180, 360)} className="fr-gauge-track" />
                    {SEGMENTS.map((s, i) => (
                        <path key={s.label} d={arcPath(180 + i * 36 + 1.5, 180 + (i + 1) * 36 - 1.5)} stroke={s.color} className="fr-gauge-seg" />
                    ))}
                    {SEGMENTS.map((s, i) => {
                        const a = ((180 + i * 36 + 18) * Math.PI) / 180;
                        return (
                            <text key={s.label} x={C.x + (R - 34) * Math.cos(a)} y={C.y + (R - 34) * Math.sin(a) + 4} className="fr-gauge-label">
                                {s.label}
                            </text>
                        );
                    })}
                    <g className="fr-needle" style={{ transform: `rotate(${angle}deg)` }}>
                        <path d="M 146 150 L 150 44 L 154 150 Z" />
                    </g>
                    <circle cx={C.x} cy={C.y} r="13" className="fr-needle-hub" />
                    <g className="fr-crack">
                        <path d="M 150 60 l 14 18 l -9 12 l 18 16 M 164 78 l 20 -6 M 155 90 l -16 10 l -6 18" />
                    </g>
                </svg>
                <div className="fr-readout">
                    {phase === 'overload' ? <span className="fr-readout-inf">∞</span> : <span>{pct}%</span>}
                </div>
                {phase === 'overload' && <div className="fr-stamp">OVERLOAD 💥</div>}
            </div>

            {phase === 'overload' ? (
                <div className="fr-meter-result">
                    <p className="fr-result-big">Result: off the charts 😂</p>
                    <p className="fr-sub">Error 404 — friendship limit not found.</p>
                    <button type="button" className="fr-btn" onClick={next}>
                        Let's party 🎉
                    </button>
                </div>
            ) : (
                <button type="button" className={`fr-btn ${phase === 'scanning' ? 'is-busy' : ''}`} onClick={scan} disabled={phase !== 'idle'}>
                    {phase === 'scanning' ? 'Scanning… 🔍' : 'Start scan 🔍'}
                </button>
            )}
        </div>
    );
}
