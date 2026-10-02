import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';
import { confettiBurst, heartBurst, sparkle } from '../lib/fx';

const MAX_PULL = 110;
const ARROW_LEN = 120;

function useViewport() {
    const [vp, setVp] = useState({ w: innerWidth, h: innerHeight });
    useEffect(() => {
        const on = () => setVp({ w: innerWidth, h: innerHeight });
        window.addEventListener('resize', on);
        return () => window.removeEventListener('resize', on);
    }, []);
    return vp;
}

export function GlossyHeart({ className = '' }) {
    return (
        <svg viewBox="0 0 200 180" className={className}>
            <defs>
                <radialGradient id="bdHeartFill" cx="35%" cy="25%" r="85%">
                    <stop offset="0%" stopColor="#FFD1E2" />
                    <stop offset="35%" stopColor="#FF7BAC" />
                    <stop offset="75%" stopColor="#F2387A" />
                    <stop offset="100%" stopColor="#C8175A" />
                </radialGradient>
                <filter id="bdHeartBlur" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" />
                </filter>
            </defs>
            <path
                d="M100 172 C 34 122, 4 84, 8 50 C 12 18, 40 4, 64 6 C 82 8, 94 20, 100 34 C 106 20, 118 8, 136 6 C 160 4, 188 18, 192 50 C 196 84, 166 122, 100 172 Z"
                fill="url(#bdHeartFill)"
            />
            <ellipse cx="58" cy="44" rx="22" ry="12" fill="#fff" opacity=".85" filter="url(#bdHeartBlur)" transform="rotate(-20 58 44)" />
            <ellipse cx="148" cy="60" rx="6" ry="4" fill="#fff" opacity=".45" />
        </svg>
    );
}

function Bow({ pull }) {
    const nockX = -14 - pull * 0.55;
    return (
        <g>
            <polyline points={`-14,-72 ${nockX},0 -14,72`} fill="none" stroke="#EADFCF" strokeWidth="1.4" />
            <path d="M -14 -72 Q 4 -66 12 -40 Q 22 0 12 40 Q 4 66 -14 72" fill="none" stroke="url(#bdBowWood)" strokeWidth="6" strokeLinecap="round" />
            <rect x="9" y="-11" width="13" height="22" rx="4" fill="#3B2216" />
            <ArrowShape x={nockX} />
        </g>
    );
}

function ArrowShape({ x = 0 }) {
    const tip = x + ARROW_LEN;
    return (
        <g>
            <line x1={x} y1="0" x2={tip - 8} y2="0" stroke="#7A4A2B" strokeWidth="3" strokeLinecap="round" />
            <path d={`M ${x + 2} 0 L ${x - 8} -9 L ${x + 14} -9 L ${x + 22} 0 L ${x + 14} 9 L ${x - 8} 9 Z`} fill="#FF6FA3" opacity=".95" />
            <path d={`M ${x + 2} 0 L ${x + 22} 0`} stroke="#fff" strokeWidth="1" opacity=".6" />
            {/* heart tip, pointing forward */}
            <g transform={`translate(${tip} 0) rotate(-90) scale(.11)`}>
                <path d="M0 80 C -60 30, -90 -10, -86 -44 C -82 -76, -54 -90, -30 -88 C -12 -86, -6 -74, 0 -60 C 6 -74, 12 -86, 30 -88 C 54 -90, 82 -76, 86 -44 C 90 -10, 60 30, 0 80 Z" fill="#F2387A" />
            </g>
            <circle cx={tip - 2} cy="-4" r="2.4" fill="#FFB3CF" />
        </g>
    );
}

// Scene 2 — pull back anywhere, release, and send the arrow into the heart.
export default function Arrow({ next }) {
    const { w, h } = useViewport();
    const mobile = w < 640;
    const H = { x: w / 2, y: h * (mobile ? 0.34 : 0.38) };
    const heartSize = Math.min(mobile ? 150 : 180, w * 0.42, h * 0.26);
    const B = { x: w * (mobile ? 0.3 : 0.28), y: h * (mobile ? 0.76 : 0.72) };
    const aimAtHeart = Math.atan2(H.y - B.y, H.x - B.x);

    const [angle, setAngle] = useState(aimAtHeart);
    const [pull, setPull] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [touched, setTouched] = useState(false);
    const [flight, setFlight] = useState(null); // { x, y, a, fade }
    const [phase, setPhase] = useState('aim'); // aim → flying → hit → done
    const [message, setMessage] = useState('');
    const misses = useRef(0);
    const startPt = useRef(null);

    // Keep aiming at the heart when the viewport changes while idle.
    useEffect(() => {
        if (!dragging && phase === 'aim') setAngle(aimAtHeart);
    }, [w, h]); // eslint-disable-line react-hooks/exhaustive-deps

    const onDown = (e) => {
        if (phase !== 'aim') return;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        startPt.current = { x: e.clientX, y: e.clientY };
        setDragging(true);
        setTouched(true);
        setMessage('');
    };

    const onMove = (e) => {
        if (!dragging || !startPt.current) return;
        const dx = startPt.current.x - e.clientX;
        const dy = startPt.current.y - e.clientY;
        const d = Math.hypot(dx, dy);
        setPull(Math.min(d, MAX_PULL));
        if (d > 8) setAngle(Math.atan2(dy, dx));
    };

    const onUp = () => {
        if (!dragging) return;
        setDragging(false);
        startPt.current = null;
        if (pull < 30) {
            setPull(0);
            setAngle(aimAtHeart);
            if (pull > 0) setMessage('pull back a little further 🏹');
            return;
        }
        fire();
    };

    const fire = () => {
        let diff = angle - aimAtHeart;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        const tolerance = misses.current >= 2 ? 0.75 : 0.32;
        const hit = Math.abs(diff) < tolerance;

        const a0 = hit ? aimAtHeart : angle;
        const tipOffset = ARROW_LEN - 14;
        const sx = B.x + Math.cos(a0) * (tipOffset - ARROW_LEN);
        const sy = B.y + Math.sin(a0) * (tipOffset - ARROW_LEN);
        const ex = hit ? H.x - Math.cos(a0) * (ARROW_LEN - heartSize * 0.12) : B.x + Math.cos(a0) * Math.max(w, h) * 1.3;
        const ey = hit ? H.y - Math.sin(a0) * (ARROW_LEN - heartSize * 0.12) : B.y + Math.sin(a0) * Math.max(w, h) * 1.3;
        const dur = hit ? 360 : 700;
        const power = pull / MAX_PULL;

        setPull(0);
        setPhase('flying');
        sfx.whoosh();

        const t0 = performance.now();
        const step = (now) => {
            const k = Math.min(1, (now - t0) / dur);
            const e = 1 - Math.pow(1 - k, 2);
            // A gentle arc: the arrow lifts then dips into the target.
            const lift = Math.sin(e * Math.PI) * (hit ? 18 : 30) * (1 - power * 0.5);
            const x = sx + (ex - sx) * e;
            const y = sy + (ey - sy) * e - lift;
            const tilt = Math.cos(e * Math.PI) * (hit ? 0.12 : 0.18);
            setFlight({ x, y, a: a0 - tilt });
            if (k < 1) return requestAnimationFrame(step);
            hit ? onHit() : onMiss();
        };
        requestAnimationFrame(step);
    };

    const onHit = () => {
        setPhase('hit');
        sfx.thunk();
        setTimeout(() => {
            sfx.pop();
            sfx.chime();
            setFlight(null);
            heartBurst(H.x, H.y, 80, 12);
            confettiBurst(H.x, H.y, 60, { power: 9 });
            sparkle(H.x, H.y, 40, '#FFD1E2');
            setPhase('done');
            setTimeout(next, 1400);
        }, 650);
    };

    const onMiss = () => {
        misses.current += 1;
        setFlight(null);
        setPhase('aim');
        setAngle(aimAtHeart);
        setMessage(misses.current >= 2 ? 'almost! aim right at the heart 💘' : 'so close… try again 💘');
    };

    const deg = (angle * 180) / Math.PI;
    const tipX = B.x + Math.cos(angle) * (ARROW_LEN - 14 - pull * 0.55);
    const tipY = B.y + Math.sin(angle) * (ARROW_LEN - 14 - pull * 0.55);

    return (
        <div
            className={`bd-arrow-scene is-${phase}`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
        >
            <h2 className="bd-arrow-title bd-rise" style={{ '--d': '0.2s' }}>a little something, for you</h2>

            <div className="bd-arrow-heart" style={{ left: H.x, top: H.y, width: heartSize, height: heartSize * 0.9 }}>
                <div className="bd-arrow-heart-glow" />
                <div className="bd-arrow-heart-beat">
                    <GlossyHeart />
                </div>
            </div>

            <svg className="bd-arrow-svg" width={w} height={h}>
                <defs>
                    <linearGradient id="bdBowWood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#5A3420" />
                        <stop offset=".5" stopColor="#8B5A36" />
                        <stop offset="1" stopColor="#5A3420" />
                    </linearGradient>
                </defs>
                {dragging && pull > 20 && (
                    <line
                        x1={tipX}
                        y1={tipY}
                        x2={tipX + Math.cos(angle) * (140 + pull * 2)}
                        y2={tipY + Math.sin(angle) * (140 + pull * 2)}
                        className="bd-aim-line"
                    />
                )}
                <g transform={`translate(${B.x} ${B.y}) rotate(${deg})`}>
                    <g className={phase === 'aim' && !dragging ? 'bd-bow-idle' : ''}>
                        {phase === 'aim' ? <Bow pull={pull} /> : <BowEmpty />}
                    </g>
                </g>
                {flight && (
                    <g transform={`translate(${flight.x} ${flight.y}) rotate(${(flight.a * 180) / Math.PI})`}>
                        <ArrowShape x={0} />
                    </g>
                )}
            </svg>

            {!touched && (
                <div className="bd-ghost-hand" style={{ left: B.x, top: B.y }}>
                    👆
                </div>
            )}

            <p className="bd-arrow-hint bd-rise" style={{ '--d': '0.6s' }}>
                {message || (phase === 'done' ? 'right in the heart 💘' : 'pull & release')}
            </p>
            {phase === 'done' && <div className="bd-flash bd-flash-pink" />}
        </div>
    );
}

function BowEmpty() {
    return (
        <g>
            <line x1="-14" y1="-72" x2="-14" y2="72" stroke="#EADFCF" strokeWidth="1.4" />
            <path d="M -14 -72 Q 4 -66 12 -40 Q 22 0 12 40 Q 4 66 -14 72" fill="none" stroke="url(#bdBowWood)" strokeWidth="6" strokeLinecap="round" />
            <rect x="9" y="-11" width="13" height="22" rx="4" fill="#3B2216" />
        </g>
    );
}
