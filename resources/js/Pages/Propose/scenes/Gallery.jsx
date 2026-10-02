import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../Birthday/lib/audio';
import { sparkle } from '../../Birthday/lib/fx';

const PH = ['#F6C1CF', '#F3D2B0', '#E8D8F2', '#CDE8D6'];

// Gold foil over one exhibit; scratch past ~50% and it falls away.
function Foil({ onClear }) {
    const ref = useRef(null);
    const drawing = useRef(false);
    const last = useRef(null);
    const moves = useRef(0);
    const [gone, setGone] = useState(false);

    useEffect(() => {
        const canvas = ref.current;
        const r = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = r.width * dpr;
        canvas.height = r.height * dpr;
        const c = canvas.getContext('2d');
        c.scale(dpr, dpr);
        const g = c.createLinearGradient(0, 0, r.width, r.height);
        g.addColorStop(0, '#E2C58F');
        g.addColorStop(0.5, '#D3AF6C');
        g.addColorStop(1, '#C49A55');
        c.fillStyle = g;
        c.fillRect(0, 0, r.width, r.height);
        c.strokeStyle = 'rgba(255,255,255,.12)';
        c.lineWidth = 1;
        for (let x = -r.height; x < r.width; x += 14) {
            c.beginPath();
            c.moveTo(x, r.height);
            c.lineTo(x + r.height, 0);
            c.stroke();
        }
        for (let k = 0; k < 90; k++) {
            c.fillStyle = `rgba(255,255,255,${Math.random() * 0.45})`;
            c.beginPath();
            c.arc(Math.random() * r.width, Math.random() * r.height, Math.random() * 1.6, 0, Math.PI * 2);
            c.fill();
        }
        c.textAlign = 'center';
        c.font = '28px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        c.fillText('👉', r.width / 2, r.height / 2 - 18);
        c.fillStyle = '#5A3A18';
        c.font = '700 20px "Shantell Sans", cursive';
        c.fillText('Scratch to see it', r.width / 2, r.height / 2 + 16);
        c.font = '600 11px Fredoka, sans-serif';
        c.fillStyle = 'rgba(90,58,24,.7)';
        c.fillText('DRAG YOUR FINGER ACROSS', r.width / 2, r.height / 2 + 36);
    }, []);

    const pt = (e) => {
        const r = ref.current.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const scratch = (p) => {
        const c = ref.current.getContext('2d');
        c.globalCompositeOperation = 'destination-out';
        c.lineWidth = 46;
        c.lineCap = 'round';
        c.beginPath();
        const f = last.current || p;
        c.moveTo(f.x, f.y);
        c.lineTo(p.x, p.y);
        c.stroke();
        last.current = p;
        if (++moves.current % 10 === 0) check();
    };

    const check = () => {
        const cv = ref.current;
        const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
        let clear = 0;
        let n = 0;
        for (let k = 3; k < d.length; k += 4 * 30) {
            n++;
            if (d[k] === 0) clear++;
        }
        if (clear / n > 0.5 && !gone) {
            setGone(true);
            onClear();
        }
    };

    return (
        <canvas
            ref={ref}
            className={`pr-foil ${gone ? 'is-gone' : ''}`}
            onPointerDown={(e) => {
                drawing.current = true;
                last.current = null;
                e.currentTarget.setPointerCapture?.(e.pointerId);
                scratch(pt(e));
            }}
            onPointerMove={(e) => drawing.current && scratch(pt(e))}
            onPointerUp={() => {
                drawing.current = false;
                check();
            }}
            onPointerCancel={() => (drawing.current = false)}
        />
    );
}

function Exhibit({ g, i }) {
    const [failed, setFailed] = useState(!g.photo);
    return failed ? (
        <div className="pr-exhibit-ph" style={{ background: PH[i % 4] }}>
            <span>{g.emoji}</span>
            <small>add photo {i + 1}.jpg</small>
        </div>
    ) : (
        <img src={g.photo} alt="" draggable="false" onError={() => setFailed(true)} />
    );
}

// Room 1 — framed photos, each covered in gold foil to scratch away.
export default function Gallery({ from, gallery, next }) {
    const [i, setI] = useState(0);
    const [seen, setSeen] = useState([]);
    const frameRef = useRef(null);
    const g = gallery[i];

    const cleared = () => {
        setSeen((s) => (s.includes(i) ? s : [...s, i]));
        sfx.chime();
        const r = frameRef.current.getBoundingClientRect();
        sparkle(r.left + r.width / 2, r.top + r.height / 2, 36, '#FFE3A3');
    };

    const go = (d) => {
        sfx.tick();
        setI((v) => Math.max(0, Math.min(gallery.length - 1, v + d)));
    };

    return (
        <div className="pr-room pr-gallery">
            <h2 className="pr-head">
                Our <mark className="pr-mark pr-mark-static" style={{ '--m': '#F9D2C1', '--ink': '#D9822B' }}>photos</mark>
            </h2>
            <p className="pr-sub">Each one is covered. Rub your finger across to see it.</p>

            <div className="pr-frame" ref={frameRef}>
                <div className="pr-frame-mat">
                    <div className="pr-exhibit" key={i}>
                        <Exhibit g={g} i={i} />
                        {!seen.includes(i) && <Foil onClear={cleared} />}
                    </div>
                </div>
            </div>
            <div className="pr-plaque">
                <b>{g.title || 'Untitled'}</b>
                <small>Exhibit {i + 1} · from the {from} collection</small>
            </div>

            <div className="pr-pager">
                <button type="button" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous">←</button>
                <span>{i + 1} / {gallery.length}</span>
                <button type="button" onClick={() => go(1)} disabled={i === gallery.length - 1} aria-label="Next">→</button>
            </div>

            <button type="button" className={`pr-btn ${seen.length >= gallery.length ? 'is-ready' : ''}`} onClick={next}>
                Keep walking →
            </button>
        </div>
    );
}
