import { useEffect } from 'react';
import { sfx } from '../../Birthday/lib/audio';
import { confettiRain, emojiBurst, firework } from '../../Birthday/lib/fx';

const PARTY = ['🎉', '🥳', '🎊', '🍻', '🕺', '💃'];
const DANCERS = ['🕺', '🥳', '🎂', '🍻', '💃'];

function daysSince(date) {
    if (!date) return null;
    const t = new Date(String(date).replace(' ', 'T')).getTime();
    return Number.isNaN(t) ? null : Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

// Scene 7 — disco finale: spinning mirror ball, light beams, dancing emoji
// and fireworks.
export default function Finale({ to, from, friendsSince, sticker, replay }) {
    const days = daysSince(friendsSince);

    useEffect(() => {
        const timers = [];
        for (let i = 0; i < 12; i++) {
            timers.push(
                setTimeout(() => {
                    firework();
                    if (i % 2 === 0) sfx.firework();
                }, 700 + i * 480),
            );
        }
        timers.push(setTimeout(() => confettiRain(4000, 3), 900));
        timers.push(setTimeout(() => emojiBurst(innerWidth / 2, innerHeight, PARTY, 30, 18), 1400));
        const keep = setInterval(() => firework(), 3800);
        return () => {
            timers.forEach(clearTimeout);
            clearInterval(keep);
        };
    }, []);

    return (
        <div className="fr-finale">
            <div className="fr-beams" aria-hidden="true">
                <span />
                <span />
                <span />
            </div>
            <div className="fr-disco-wrap" aria-hidden="true">
                <div className="fr-disco-string" />
                <div className="fr-disco" />
            </div>

            <h1 className="fr-finale-title">
                {'HAPPY'.split('').map((ch, i) => (
                    <span key={i} className="fr-pop fr-wave" style={{ '--i': i, '--d': `${0.2 + i * 0.07}s` }}>
                        {ch}
                    </span>
                ))}
                <br />
                {'BIRTHDAY'.split('').map((ch, i) => (
                    <span key={i} className="fr-pop fr-wave" style={{ '--i': i + 5, '--d': `${0.55 + i * 0.07}s` }}>
                        {ch}
                    </span>
                ))}
            </h1>
            <p className="fr-finale-name">{to}!</p>

            <div className="fr-dancers">
                {sticker ? (
                    <img src={sticker} alt="" className="fr-sticker" />
                ) : (
                    DANCERS.map((e, i) => (
                        <span key={i} className="fr-dancer" style={{ '--i': i }}>
                            {e}
                        </span>
                    ))
                )}
            </div>

            {days !== null && (
                <div className="fr-stats">
                    <div>
                        <b>{days.toLocaleString()}</b>
                        <span>days of friendship</span>
                    </div>
                    <div>
                        <b>∞</b>
                        <span>inside jokes</span>
                    </div>
                    <div>
                        <b>1</b>
                        <span>absolute legend</span>
                    </div>
                </div>
            )}

            <p className="fr-sign">
                From your partner in crime — <b>{from}</b> 🤜🤛
            </p>
            <button type="button" className="fr-link fr-replay" onClick={replay}>
                ↺ party again
            </button>
        </div>
    );
}
