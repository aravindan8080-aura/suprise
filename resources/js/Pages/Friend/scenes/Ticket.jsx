import { useRef, useState } from 'react';
import { sfx, start } from '../../Birthday/lib/audio';
import { confettiBurst, emojiBurst } from '../../Birthday/lib/fx';

const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

// Scene 1 — a VIP party ticket. "Tear & enter" starts the music (first user
// gesture) and rips the stub off along the perforation.
export default function Ticket({ to, from, age, music, next }) {
    const [torn, setTorn] = useState(false);
    const perfRef = useRef(null);

    const tear = () => {
        if (torn) return;
        start(music, { beat: 0.44 });
        setTorn(true);
        sfx.whoosh();
        const r = perfRef.current.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        setTimeout(() => {
            sfx.pop();
            sfx.chime();
            confettiBurst(x, y, 120, { power: 13 });
            emojiBurst(x, y, ['🎉', '🥳', '🎊', '⭐'], 14, 12);
        }, 250);
        setTimeout(next, 1500);
    };

    return (
        <div className={`fr-ticket-scene ${torn ? 'is-torn' : ''}`}>
            <p className="fr-kicker bd-rise" style={{ '--d': '0.2s' }}>🚨 Party alert 🚨</p>

            <div className="fr-ticket">
                <div className="fr-ticket-main">
                    <span className="fr-ticket-vip">★ VIP PASS ★</span>
                    <span className="fr-ticket-admit">Admit one</span>
                    <h1 className="fr-ticket-name">{to}</h1>
                    <p className="fr-ticket-desc">to the birthday celebration of the year</p>
                    <div className="fr-ticket-meta">
                        <div><b>Date</b>{today}</div>
                        <div><b>Seat</b>Best-friend row</div>
                        <div><b>Issued by</b>{from}</div>
                    </div>
                </div>
                <div className="fr-ticket-perf" ref={perfRef} />
                <div className="fr-ticket-stub">
                    <span className="fr-stub-level">LVL<b>{age}</b></span>
                    <span className="fr-barcode" />
                    <span className="fr-stub-no">No. 000{age}</span>
                </div>
            </div>

            <button type="button" className="fr-btn bd-rise" style={{ '--d': '1.1s' }} onClick={tear}>
                Tear &amp; enter 🎟️
            </button>
            <p className="fr-hint bd-rise" style={{ '--d': '1.3s' }}>🔊 turn the sound up — it's a party</p>
        </div>
    );
}
