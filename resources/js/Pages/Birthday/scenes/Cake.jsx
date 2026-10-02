import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';
import { confettiBurst, confettiRain, sparkle } from '../lib/fx';

const CANDLE_COLORS = ['#FF8FB1', '#39D0C4', '#F6C453', '#A78BFA', '#FF7A59'];
const HOLD_MS = 1400;

// Scene 4 — make a wish and blow out the candles: hold the button, or
// really blow into the microphone.
export default function Cake({ to, next }) {
    const [progress, setProgress] = useState(0);
    const [out, setOut] = useState([]); // indexes of extinguished candles
    const [phase, setPhase] = useState('wish'); // wish → blown → party
    const [micState, setMicState] = useState('off'); // off → on → denied
    const holding = useRef(false);
    const progressRef = useRef(0);
    const cakeRef = useRef(null);
    const micLevel = useRef(0);
    const stopMic = useRef(null);

    // One loop drives progress from both the hold button and the mic.
    useEffect(() => {
        if (phase !== 'wish') return;
        let raf;
        let last = performance.now();
        const tick = (now) => {
            const dt = now - last;
            last = now;
            let p = progressRef.current;
            if (holding.current || micLevel.current > 0.5) {
                p += dt / HOLD_MS;
            } else {
                p -= dt / (HOLD_MS * 1.5);
            }
            p = Math.max(0, Math.min(1, p));
            progressRef.current = p;
            setProgress(p);
            if (p >= 1) return blowOut();
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => () => stopMic.current?.(), []);

    const blowOut = () => {
        holding.current = false;
        stopMic.current?.();
        setPhase('blown');
        sfx.blow();
        CANDLE_COLORS.forEach((_, i) => setTimeout(() => setOut((o) => [...o, i]), 90 + i * 110));
        setTimeout(() => {
            const r = cakeRef.current.getBoundingClientRect();
            const x = r.left + r.width / 2;
            const y = r.top + r.height * 0.3;
            setPhase('party');
            sfx.pop();
            sfx.chime();
            confettiBurst(x, y, 140, { power: 15, spread: Math.PI * 1.2 });
            confettiBurst(0, innerHeight * 0.7, 60, { power: 16, spread: 0.8, angle: -Math.PI / 3 });
            confettiBurst(innerWidth, innerHeight * 0.7, 60, { power: 16, spread: 0.8, angle: (-2 * Math.PI) / 3 });
            confettiRain(4500, 2);
            sparkle(x, y - 40, 40);
        }, 1100);
    };

    const enableMic = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AC = window.AudioContext || window.webkitAudioContext;
            const actx = new AC();
            const src = actx.createMediaStreamSource(stream);
            // Blowing is loud low-frequency noise; filter to that band.
            const lp = actx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.value = 600;
            const an = actx.createAnalyser();
            an.fftSize = 512;
            src.connect(lp).connect(an);
            const buf = new Uint8Array(an.fftSize);
            let raf;
            const read = () => {
                an.getByteTimeDomainData(buf);
                let sum = 0;
                for (let i = 0; i < buf.length; i++) {
                    const v = (buf[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / buf.length);
                micLevel.current = Math.min(1, rms * 6);
                raf = requestAnimationFrame(read);
            };
            read();
            stopMic.current = () => {
                cancelAnimationFrame(raf);
                stream.getTracks().forEach((t) => t.stop());
                actx.close();
                micLevel.current = 0;
                stopMic.current = null;
            };
            setMicState('on');
        } catch {
            setMicState('denied');
        }
    };

    const lean = phase === 'wish' ? progress * 38 : 60;

    return (
        <div className={`bd-cake-scene is-${phase}`} onClick={() => phase === 'party' && next()}>
            <h2 className="bd-step-title bd-rise" style={{ '--d': '0.1s' }}>
                First things first <span className="bd-bob-emoji">🎂</span>
            </h2>

            <div className="bd-cake-stage bd-cake-rise" style={{ '--lean': `${lean}deg` }}>
                <div className="bd-cake-glow" />
                <div className="bd-cake" ref={cakeRef}>
                    <div className="bd-candles">
                        {CANDLE_COLORS.map((color, i) => (
                            <div key={i} className={`bd-candle ${out.includes(i) ? 'is-out' : ''}`} style={{ '--c': color, '--i': i }}>
                                <div className="bd-flame">
                                    <div className="bd-flame-inner" />
                                </div>
                                <div className="bd-flame-halo" />
                                <div className="bd-smoke">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                <div className="bd-candle-body" />
                            </div>
                        ))}
                    </div>
                    <div className="bd-cake-body">
                        <svg className="bd-icing" viewBox="0 0 240 64" preserveAspectRatio="none">
                            <path d="M0 8 Q0 0 10 0 H230 Q240 0 240 8 V26 Q236 34 232 26 V22 Q228 14 224 22 V30 Q220 44 214 30 V24 Q208 16 200 26 V46 Q196 58 190 46 V24 Q184 16 176 24 V34 Q172 42 166 32 V22 Q160 14 152 24 V30 Q146 40 140 28 V22 Q134 16 126 26 V52 Q122 62 116 52 V24 Q110 16 102 24 V36 Q96 46 90 34 V22 Q84 14 76 24 V30 Q70 38 64 28 V24 Q58 16 50 26 V44 Q46 54 40 44 V24 Q34 16 26 24 V30 Q20 38 14 28 V22 Q8 16 4 24 Q0 30 0 22 Z" fill="#FFF7FB" />
                        </svg>
                    </div>
                    <div className="bd-plate" />
                </div>
            </div>

            {phase === 'party' ? (
                <div className="bd-cake-party">
                    <h1 className="bd-script bd-hb-glow">Happy Birthday, {to}!</h1>
                    <p className="bd-tap-hint is-on">tap anywhere to continue</p>
                </div>
            ) : (
                <div className={`bd-cake-controls ${phase !== 'wish' ? 'is-hidden' : ''}`}>
                    <p className="bd-cake-wish">Close your eyes, make a wish… then blow 🌬️</p>
                    <button
                        type="button"
                        className="bd-btn bd-btn-hold"
                        style={{ '--p': progress }}
                        onPointerDown={(e) => {
                            e.currentTarget.setPointerCapture?.(e.pointerId);
                            holding.current = true;
                        }}
                        onPointerUp={() => (holding.current = false)}
                        onPointerCancel={() => (holding.current = false)}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        <span className="bd-btn-hold-fill" />
                        <span className="bd-btn-label">Hold to blow 🕯️</span>
                    </button>
                    {navigator.mediaDevices?.getUserMedia && micState !== 'on' && (
                        <button type="button" className="bd-link" onClick={enableMic}>
                            {micState === 'denied' ? 'mic blocked — just hold the button 💨' : '🎤 or really blow into your mic'}
                        </button>
                    )}
                    {micState === 'on' && <p className="bd-hint">🎤 listening… blow!</p>}
                </div>
            )}
        </div>
    );
}
