import { useEffect } from 'react';
import { sfx } from '../lib/audio';
import { confettiRain, firework } from '../lib/fx';

// Scene 9 — the grand finale: letters pop in, fireworks, and a sign-off.
export default function Finale({ to, from, sticker, replay }) {
    useEffect(() => {
        const timers = [];
        for (let i = 0; i < 14; i++) {
            timers.push(setTimeout(() => {
                firework();
                if (i % 2 === 0) sfx.firework();
            }, 900 + i * 520 + Math.random() * 300));
        }
        timers.push(setTimeout(() => confettiRain(3500, 2), 1600));
        // Keep a gentle firework going every few seconds after the show.
        const keep = setInterval(() => firework(), 4200);
        return () => {
            timers.forEach(clearTimeout);
            clearInterval(keep);
        };
    }, []);

    const word = (text, offset) =>
        Array.from(text).map((ch, i) => (
            <span key={i} className="bd-pop-letter" style={{ '--d': `${offset + i * 0.07}s` }}>
                {ch}
            </span>
        ));

    return (
        <div className="bd-finale">
            {Array.from({ length: 14 }, (_, i) => (
                <span key={i} className="bd-bokeh" style={{ '--i': i, left: `${(i * 53) % 100}%`, top: `${(i * 31) % 100}%` }} />
            ))}

            <h1 className="bd-finale-title">
                <span className="bd-finale-line">{word('HAPPY', 0.2)}</span>
                <span className="bd-finale-line">{word('BIRTHDAY', 0.6)}</span>
            </h1>
            <p className="bd-script bd-finale-name">{to}!</p>

            <div className="bd-sticker">
                {sticker ? (
                    <img src={sticker} alt="" />
                ) : (
                    <div className="bd-bouquet">
                        <span className="bd-bq bd-bq-1">💐</span>
                        <span className="bd-bq bd-bq-2">🧸</span>
                        <span className="bd-bq bd-bq-3">🎈</span>
                    </div>
                )}
            </div>

            <p className="bd-finale-sign">
                Made with love, just for you — <b>{from}</b> 💛
            </p>
            <button type="button" className="bd-link bd-replay" onClick={replay}>↺ watch it again</button>
        </div>
    );
}
