import { useEffect, useMemo, useState } from 'react';
import { sfx } from '../../Birthday/lib/audio';
import { confettiBurst, heartBurst } from '../../Birthday/lib/fx';

const N = 3;

// Without a photo, paint a soft placeholder picture to cut up instead.
function placeholderImage(to, from) {
    const s = 600;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, s, s);
    grad.addColorStop(0, '#FFD6E0');
    grad.addColorStop(0.5, '#FBC4A8');
    grad.addColorStop(1, '#E9C9F2');
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 40; i++) {
        g.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
        g.beginPath();
        g.arc(Math.random() * s, Math.random() * s, 4 + Math.random() * 20, 0, Math.PI * 2);
        g.fill();
    }
    g.textAlign = 'center';
    g.font = '220px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
    g.fillText('💑', s / 2, s / 2 + 60);
    g.fillStyle = '#7A1F3D';
    g.font = '64px "Great Vibes", cursive';
    g.fillText(`${to} & ${from}`, s / 2, s - 60, s - 60);
    return c.toDataURL('image/png');
}

function shuffled() {
    const a = [...Array(N * N).keys()];
    do {
        for (let i = a.length - 1; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            [a[i], a[j]] = [a[j], a[i]];
        }
    } while (a.every((v, i) => v === i));
    return a;
}

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Room 2 — "this photo fell apart": swap tiles back into place.
export default function Puzzle({ to, from, puzzlePhoto, next }) {
    const [src, setSrc] = useState(puzzlePhoto);
    const [tiles, setTiles] = useState(shuffled); // tiles[slot] = piece
    const [sel, setSel] = useState(null);
    const [moves, setMoves] = useState(0);
    const [secs, setSecs] = useState(0);
    const [peek, setPeek] = useState(false);
    const [dragFrom, setDragFrom] = useState(null);
    const solved = useMemo(() => tiles.every((p, i) => p === i), [tiles]);

    // Fall back to the painted placeholder if there's no photo (or it fails).
    useEffect(() => {
        if (!puzzlePhoto) return setSrc(placeholderImage(to, from));
        const img = new Image();
        img.onerror = () => setSrc(placeholderImage(to, from));
        img.src = puzzlePhoto;
    }, [puzzlePhoto, to, from]);

    useEffect(() => {
        if (!moves || solved) return;
        const id = setInterval(() => setSecs((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, [moves > 0, solved]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!solved || !moves) return;
        sfx.chime();
        setTimeout(() => {
            heartBurst(innerWidth / 2, innerHeight * 0.4, 40, 10);
            confettiBurst(innerWidth / 2, innerHeight * 0.4, 80, { power: 11 });
        }, 300);
    }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

    const swap = (a, b) => {
        if (a === b) return;
        setTiles((t) => {
            const n = [...t];
            [n[a], n[b]] = [n[b], n[a]];
            return n;
        });
        setMoves((m) => m + 1);
        sfx.tick();
    };

    const tap = (slot) => {
        if (solved) return;
        if (sel === null) return setSel(slot);
        swap(sel, slot);
        setSel(null);
    };

    const dropAt = (e) => {
        if (dragFrom === null) return;
        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-slot]');
        const to = el ? Number(el.dataset.slot) : null;
        if (to !== null && to !== dragFrom) {
            swap(dragFrom, to);
            setSel(null);
        }
        setDragFrom(null);
    };

    return (
        <div className="pr-room pr-puzzle">
            <h2 className="pr-head">
                This photo fell <mark className="pr-mark pr-mark-static" style={{ '--m': '#F9D2C1', '--ink': '#D9822B' }}>apart</mark>.
            </h2>
            <p className="pr-sub">Nine pieces. Tap two to swap them, or drag one where you want it.</p>

            <div className={`pr-board ${solved && moves ? 'is-solved' : ''}`} onPointerUp={dropAt}>
                {tiles.map((piece, slot) => (
                    <button
                        type="button"
                        key={piece}
                        data-slot={slot}
                        className={`pr-tile ${sel === slot ? 'is-sel' : ''} ${dragFrom === slot ? 'is-drag' : ''}`}
                        style={{
                            backgroundImage: src ? `url("${src}")` : undefined,
                            backgroundPosition: `${(piece % N) * 50}% ${Math.floor(piece / N) * 50}%`,
                            gridRow: Math.floor(slot / N) + 1,
                            gridColumn: (slot % N) + 1,
                        }}
                        onClick={() => tap(slot)}
                        onPointerDown={(e) => {
                            if (solved) return;
                            e.currentTarget.releasePointerCapture?.(e.pointerId);
                            setDragFrom(slot);
                        }}
                        aria-label={`Piece ${slot + 1}`}
                    />
                ))}
                {peek && <div className="pr-peek" style={{ backgroundImage: `url("${src}")` }} />}
            </div>

            <div className="pr-stats">
                <span>Moves <b>{moves}</b></span>
                <span>⏱ <b>{fmt(secs)}</b></span>
                <button
                    type="button"
                    className="pr-peek-btn"
                    onPointerDown={() => setPeek(true)}
                    onPointerUp={() => setPeek(false)}
                    onPointerLeave={() => setPeek(false)}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    👁 Hold to peek
                </button>
            </div>

            {solved && moves > 0 ? (
                <>
                    <p className="pr-sub pr-solved-msg">
                        Fixed it in <b>{moves}</b> moves and <b>{fmt(secs)}</b>. {from} would like you to know that took them longer.
                    </p>
                    <button type="button" className="pr-btn is-ready" onClick={next}>
                        Next room →
                    </button>
                </>
            ) : (
                <button type="button" className="pr-link" onClick={() => { setTiles([...Array(N * N).keys()]); setMoves((m) => m || 1); }}>
                    stuck? fix it for me
                </button>
            )}
        </div>
    );
}
