import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../Birthday/lib/audio';
import { confettiBurst } from '../../Birthday/lib/fx';

const CARD_COLORS = ['#FFD23F', '#3BCEAC', '#FF8C42', '#B388FF'];
const CLEAR_AT = 0.5; // fraction scratched before the foil falls away

function ScratchCard({ card, i, revealed, onReveal }) {
    const canvasRef = useRef(null);
    const drawing = useRef(false);
    const last = useRef(null);
    const moves = useRef(0);

    // Paint the gold foil.
    useEffect(() => {
        const canvas = canvasRef.current;
        const r = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = r.width * dpr;
        canvas.height = r.height * dpr;
        const c = canvas.getContext('2d');
        c.scale(dpr, dpr);
        const g = c.createLinearGradient(0, 0, r.width, r.height);
        g.addColorStop(0, '#C9A227');
        g.addColorStop(0.35, '#F7DC6F');
        g.addColorStop(0.55, '#E5B935');
        g.addColorStop(1, '#B8860B');
        c.fillStyle = g;
        c.fillRect(0, 0, r.width, r.height);
        // Glitter specks.
        for (let k = 0; k < 140; k++) {
            c.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
            c.fillRect(Math.random() * r.width, Math.random() * r.height, 1.5, 1.5);
        }
        c.fillStyle = 'rgba(80,50,0,.55)';
        c.font = '700 15px Fredoka, sans-serif';
        c.textAlign = 'center';
        c.fillText('✦ SCRATCH ME ✦', r.width / 2, r.height / 2 + 5);
    }, []);

    const point = (e) => {
        const r = canvasRef.current.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const scratchTo = (p) => {
        const c = canvasRef.current.getContext('2d');
        c.globalCompositeOperation = 'destination-out';
        c.lineWidth = 34;
        c.lineCap = 'round';
        c.beginPath();
        const from = last.current || p;
        c.moveTo(from.x, from.y);
        c.lineTo(p.x, p.y);
        c.stroke();
        last.current = p;
        if (++moves.current % 8 === 0) {
            sfx.tick();
            checkCleared();
        }
    };

    const checkCleared = () => {
        const canvas = canvasRef.current;
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        let clear = 0;
        let total = 0;
        for (let k = 3; k < data.length; k += 4 * 24) {
            total++;
            if (data[k] === 0) clear++;
        }
        if (clear / total > CLEAR_AT) onReveal(i);
    };

    return (
        <div className={`fr-scratch-card ${revealed ? 'is-revealed' : ''}`} style={{ '--c': CARD_COLORS[i % CARD_COLORS.length], '--i': i }}>
            <div className="fr-scratch-under">
                <span className="fr-scratch-emoji">{card.emoji}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
            </div>
            <canvas
                ref={canvasRef}
                className="fr-foil"
                onPointerDown={(e) => {
                    drawing.current = true;
                    last.current = null;
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    scratchTo(point(e));
                }}
                onPointerMove={(e) => drawing.current && scratchTo(point(e))}
                onPointerUp={() => {
                    drawing.current = false;
                    checkCleared();
                }}
                onPointerCancel={() => (drawing.current = false)}
            />
        </div>
    );
}

// Scene 4 — scratch-off cards with the things only a real friend knows.
export default function Scratch({ scratch, next }) {
    const [revealed, setRevealed] = useState([]);
    const done = revealed.length >= scratch.length;

    const reveal = (i) => {
        setRevealed((r) => {
            if (r.includes(i)) return r;
            sfx.chime();
            const n = [...r, i];
            if (n.length === scratch.length) setTimeout(() => confettiBurst(innerWidth / 2, innerHeight * 0.4, 120, { power: 13 }), 300);
            return n;
        });
    };

    return (
        <div className="fr-scratch-scene">
            <h2 className="fr-title bd-rise" style={{ '--d': '0.1s' }}>Scratch &amp; reveal ✨</h2>
            <p className="fr-sub bd-rise" style={{ '--d': '0.25s' }}>Things only a real friend knows about you</p>

            <div className="fr-scratch-grid">
                {scratch.map((card, i) => (
                    <ScratchCard key={i} card={card} i={i} revealed={revealed.includes(i)} onReveal={reveal} />
                ))}
            </div>

            {done ? (
                <button type="button" className="fr-btn bd-rise" onClick={next}>
                    Keep going ➜
                </button>
            ) : (
                <button type="button" className="fr-link" onClick={() => scratch.forEach((_, i) => reveal(i))}>
                    too lazy to scratch? reveal all 😴
                </button>
            )}
        </div>
    );
}
