import { useEffect } from 'react';
import { firework } from '../../Birthday/lib/fx';

const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';

// Draws the keepsake card onto a canvas and downloads it as a PNG.
function saveCard(to, from, line) {
    const w = 900;
    const h = 1200;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#FFE4EC');
    bg.addColorStop(1, '#FFC8D8');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.font = `60px ${EMOJI_FONT}`;
    for (let i = 0; i < 26; i++) {
        g.globalAlpha = 0.18 + Math.random() * 0.2;
        g.fillText('💗', Math.random() * w, Math.random() * h);
    }
    g.globalAlpha = 1;
    g.setLineDash([10, 10]);
    g.strokeStyle = 'rgba(200,80,120,.4)';
    g.lineWidth = 3;
    g.strokeRect(50, 50, w - 100, h - 100);
    g.setLineDash([]);
    g.textAlign = 'center';
    g.fillStyle = '#8E4A63';
    g.font = '600 34px Fredoka, sans-serif';
    g.fillText('S H E   S A I D   Y E S', w / 2, 260);
    g.fillStyle = '#A3224E';
    g.font = '120px "Great Vibes", cursive';
    g.fillText(`${to} & ${from}`, w / 2, 430, w - 140);
    g.fillStyle = 'rgba(163,34,78,.4)';
    g.fillRect(w / 2 - 80, 490, 160, 3);
    g.fillStyle = '#6B3A4E';
    g.font = '500 40px "Shantell Sans", cursive';
    g.fillText(`"${line}"`, w / 2, 610, w - 160);
    g.font = `160px ${EMOJI_FONT}`;
    g.fillText('💍', w / 2, 860);
    g.fillStyle = '#8E4A63';
    g.font = '600 36px Fredoka, sans-serif';
    g.fillText(today(), w / 2, 990);
    g.font = '28px "Shantell Sans", cursive';
    g.fillText('made by hand, for one person', w / 2, 1060);
    const a = document.createElement('a');
    a.download = `${to}-and-${from}.png`;
    a.href = c.toDataURL('image/png');
    a.click();
}

// Finale — the keepsake card, with fireworks overhead.
export default function Finale({ to, from, notes, replay }) {
    const line = notes?.[0] || 'Forever starts now';

    useEffect(() => {
        firework();
        const id = setInterval(() => firework(), 2400);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="pr-finale">
            <span className="pr-finale-hearts">💞</span>
            <h2 className="pr-head">
                Forever starts now,{' '}
                <mark className="pr-mark pr-mark-static" style={{ '--m': '#F9D2C1', '--ink': '#D9822B' }}>
                    {to}
                </mark>
                .
            </h2>

            <div className="pr-card">
                {Array.from({ length: 12 }, (_, i) => (
                    <span key={i} className="pr-card-heart" style={{ '--i': i, left: `${(i * 41) % 92}%`, top: `${(i * 29) % 90}%` }}>
                        ♥
                    </span>
                ))}
                <div className="pr-card-inner">
                    <small>she said yes</small>
                    <h3>
                        {to} &amp; {from}
                    </h3>
                    <i className="pr-card-rule" />
                    <p>"{line}"</p>
                    <span className="pr-card-ring">💍</span>
                    <b>{today()}</b>
                    <em>made by hand, for one person</em>
                </div>
            </div>

            <button type="button" className="pr-btn is-ready" onClick={() => saveCard(to, from, line)}>
                💾 Save this card
            </button>
            <p className="pr-sub pr-finale-note">Nobody else has this link. It was made by hand, for one person, and that person is you.</p>
            <button type="button" className="pr-link" onClick={replay}>
                ↺ walk through it again
            </button>
        </div>
    );
}
