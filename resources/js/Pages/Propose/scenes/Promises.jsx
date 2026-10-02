import { useState } from 'react';
import { sfx } from '../../Birthday/lib/audio';

// Room 5 — promises to tick off, each with a hand-drawn check.
export default function Promises({ to, from, promises, next }) {
    const [ticked, setTicked] = useState([]);
    const done = ticked.length >= promises.length;

    const tick = (i) => {
        setTicked((t) => (t.includes(i) ? t.filter((x) => x !== i) : [...t, i]));
        sfx.tick();
    };

    return (
        <div className="pr-room pr-promises">
            <h2 className="pr-head">
                Tick the ones you'll <mark className="pr-mark pr-mark-static" style={{ '--m': '#F9D2C1', '--ink': '#D9822B' }}>hold on to</mark>.
            </h2>

            <div className="pr-promise-card">
                <h3>Our Promises</h3>
                <small>between {from} and {to}</small>
                <ul>
                    {promises.map((p, i) => (
                        <li key={i} className={ticked.includes(i) ? 'is-ticked' : ''} onClick={() => tick(i)}>
                            <span className="pr-box">
                                <svg viewBox="0 0 24 24">
                                    <path d="M5 12.5 L10 17 L19 7" />
                                </svg>
                            </span>
                            <span className="pr-promise-text">{i + 1}. {p}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <button type="button" className={`pr-btn ${done ? 'is-ready' : ''}`} disabled={!done} onClick={next}>
                {done ? 'One last room →' : `Tick every promise (${ticked.length}/${promises.length})`}
            </button>
        </div>
    );
}
