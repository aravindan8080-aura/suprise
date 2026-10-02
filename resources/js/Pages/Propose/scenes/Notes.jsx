import { useState } from 'react';
import { sfx } from '../../Birthday/lib/audio';

// Room 3 — sticky notes on a wall; tap each to flip it open.
export default function Notes({ from, notes, next }) {
    const [open, setOpen] = useState([]);
    const done = open.length >= notes.length;

    const flip = (i) => {
        if (open.includes(i)) return;
        setOpen((o) => [...o, i]);
        sfx.tick();
        if (open.length + 1 === notes.length) setTimeout(() => sfx.chime(), 400);
    };

    return (
        <div className="pr-room pr-notes">
            <h2 className="pr-head">
                {from} wrote these <mark className="pr-mark pr-mark-static" style={{ '--m': '#F9D2C1', '--ink': '#D9822B' }}>about you</mark>
            </h2>
            <p className="pr-sub">Tap each note to open it.</p>

            <div className="pr-note-grid">
                {notes.map((n, i) => (
                    <button type="button" key={i} className={`pr-note ${open.includes(i) ? 'is-open' : ''}`} style={{ '--i': i }} onClick={() => flip(i)}>
                        <span className="pr-note-inner">
                            <span className="pr-note-front">
                                <span className="pr-note-icon">📄</span>
                                Note {i + 1}
                            </span>
                            <span className="pr-note-back">{n}</span>
                        </span>
                    </button>
                ))}
            </div>

            <p className="pr-count">{open.length} of {notes.length} opened</p>
            <button type="button" className={`pr-btn ${done ? 'is-ready' : ''}`} disabled={!done} onClick={next}>
                {done ? 'Next room →' : 'Open every note first'}
            </button>
        </div>
    );
}
