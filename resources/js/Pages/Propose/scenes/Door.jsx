import { useState } from 'react';
import { sfx } from '../../Birthday/lib/audio';
import { sparkle } from '../../Birthday/lib/fx';

const HINTS = ['Tap the brass ring 👉', 'Again…', 'One more 👀', 'Walking you in…'];

// Scene 4 — the museum door. Knock three times; it swings open into light.
export default function Door({ to, from, next }) {
    const [knocks, setKnocks] = useState(0);
    const [knockKey, setKnockKey] = useState(0);
    const open = knocks >= 3;

    const knock = (e) => {
        if (open) return;
        const n = knocks + 1;
        setKnocks(n);
        setKnockKey((k) => k + 1);
        sfx.thunk();
        if (navigator.vibrate) navigator.vibrate(25);
        if (n === 3) {
            setTimeout(() => {
                sfx.whoosh();
                sfx.chime();
                sparkle(innerWidth / 2, innerHeight / 2, 50, '#FFD98A');
            }, 350);
            setTimeout(next, 3600);
        }
    };

    return (
        <div className={`pr-door-scene ${open ? 'is-open' : ''}`}>
            <h2 className="pr-head pr-head-light">
                {from} built you a <mark className="pr-mark pr-mark-static" style={{ '--m': '#7A3B2E', '--ink': '#FFB65C' }}>museum</mark>.
            </h2>
            <p className="pr-sub pr-sub-light">Knock three times. That's the rule.</p>

            <div className="pr-door-frame" onClick={knock}>
                <div className="pr-door-inside">
                    <p className="pr-door-welcome">Come in, {to}.</p>
                    <p className="pr-door-rooms">6 rooms, and every one of them is about you.</p>
                </div>
                <div key={knockKey} className={`pr-door ${knocks && !open ? 'is-knocked' : ''}`}>
                    <div className="pr-door-panel pr-door-panel-top" />
                    <div className="pr-door-panel pr-door-panel-bottom" />
                    <div className="pr-door-sign">
                        The Museum of {to}
                        <br />
                        one visitor only
                    </div>
                    <div className="pr-knocker">
                        <span className="pr-knocker-ring" />
                    </div>
                </div>
            </div>

            <div className="pr-knocks">
                {[0, 1, 2].map((i) => (
                    <span key={i} className={i < knocks ? 'is-on' : ''} />
                ))}
            </div>
            <p className="pr-hand pr-hint-light">{HINTS[knocks]}</p>
        </div>
    );
}
