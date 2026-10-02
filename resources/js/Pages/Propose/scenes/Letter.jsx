import { useState } from 'react';
import { sfx } from '../../Birthday/lib/audio';
import { heartBurst } from '../../Birthday/lib/fx';

// Room 4 — a sealed envelope; tap the seal and the letter unfolds, one
// paragraph at a time.
export default function Letter({ from, letter, next }) {
    const [open, setOpen] = useState(false);
    const paras = letter.split(/\n\s*\n/);

    const unseal = (e) => {
        if (open) return;
        setOpen(true);
        sfx.pop();
        sfx.chime();
        heartBurst(e.clientX, e.clientY, 24, 6);
    };

    return (
        <div className="pr-room pr-letter-room">
            {!open ? (
                <>
                    <h2 className="pr-head">
                        A letter, sealed just for <mark className="pr-mark pr-mark-static" style={{ '--m': '#F9D2C1', '--ink': '#D9822B' }}>you</mark>.
                    </h2>
                    <div className="pr-env" onClick={unseal}>
                        <div className="pr-env-flap" />
                        <button type="button" className="pr-seal" aria-label="Open the letter">🌹</button>
                    </div>
                    <p className="pr-hand">👉 Tap the seal to open it</p>
                </>
            ) : (
                <>
                    <h2 className="pr-head">
                        {from} wrote you <mark className="pr-mark pr-mark-static" style={{ '--m': '#F9D2C1', '--ink': '#D9822B' }}>this</mark>.
                    </h2>
                    <div className="pr-paper">
                        {paras.map((p, i) => (
                            <p key={i} style={{ '--d': `${0.3 + i * 0.55}s` }}>{p}</p>
                        ))}
                        <p className="pr-paper-sign" style={{ '--d': `${0.3 + paras.length * 0.55}s` }}>— {from}</p>
                    </div>
                    <span className="pr-letter-emoji" style={{ '--d': `${0.6 + paras.length * 0.55}s` }}>🥰</span>
                    <button type="button" className="pr-btn is-ready pr-late" style={{ '--d': `${0.8 + paras.length * 0.55}s` }} onClick={next}>
                        Next room →
                    </button>
                </>
            )}
        </div>
    );
}
