import { useRef, useState } from 'react';
import { sfx } from '../lib/audio';
import { heartBurst, sparkle } from '../lib/fx';

// Scene 7 — a glowing envelope floats among rising hearts; a tap breaks
// the seal, opens the flap and slides the letter out.
export default function Envelope({ to, from, next }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const openIt = () => {
        if (open) return;
        setOpen(true);
        const r = ref.current.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        sfx.pop();
        sparkle(x, y, 40);
        setTimeout(() => {
            sfx.chime();
            heartBurst(x, y - 40, 30, 7);
        }, 700);
        setTimeout(next, 2000);
    };

    return (
        <div className={`bd-env-scene ${open ? 'is-open' : ''}`} onClick={openIt}>
            <h2 className="bd-step-title bd-rise" style={{ '--d': '0.1s' }}>One last thing, {to}…</h2>
            <p className="bd-step-sub bd-rise" style={{ '--d': '0.3s' }}>{from} wrote you a letter.</p>

            <div className="bd-env-wrap bd-rise" style={{ '--d': '0.5s' }}>
                <div className="bd-env-glow" />
                {Array.from({ length: 8 }, (_, i) => (
                    <span key={i} className="bd-env-float" style={{ '--i': i, left: `${10 + ((i * 37) % 80)}%` }}>
                        {['💗', '💖', '✨', '💕'][i % 4]}
                    </span>
                ))}
                <div className="bd-envelope" ref={ref}>
                    <div className="bd-env-back" />
                    <div className="bd-env-letter">
                        <span>Dear {to},</span>
                        <i />
                        <i />
                        <i />
                    </div>
                    <div className="bd-env-front" />
                    <div className="bd-env-flap" />
                    <div className="bd-env-seal">❤</div>
                </div>
            </div>

            <div className="bd-env-cta">
                <span className="bd-tap-hand">👆</span>
                <p>Tap to open your letter</p>
            </div>
        </div>
    );
}
