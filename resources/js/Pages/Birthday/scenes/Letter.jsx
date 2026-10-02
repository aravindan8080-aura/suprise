import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';

// Scene 8 — the letter writes itself onto lined paper. Tapping the paper
// finishes the typing instantly.
export default function Letter({ to, letter, next }) {
    const chars = Array.from(letter); // keeps emoji intact
    const [n, setN] = useState(0);
    const [greet, setGreet] = useState(false);
    const done = n >= chars.length;
    const scroller = useRef(null);

    useEffect(() => {
        const g = setTimeout(() => setGreet(true), 700);
        return () => clearTimeout(g);
    }, []);

    useEffect(() => {
        if (!greet || done) return;
        const ch = chars[n];
        // Pause a beat on punctuation and line breaks, like real writing.
        const delay = ch === '\n' ? 260 : /[.,!?]/.test(ch) ? 180 : 34 + Math.random() * 30;
        const t = setTimeout(() => {
            setN((v) => v + 1);
            if (n % 3 === 0 && ch.trim()) sfx.tick();
        }, n === 0 ? 600 : delay);
        return () => clearTimeout(t);
    }, [n, greet, done]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const el = scroller.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [n]);

    return (
        <div className="bd-letter-scene">
            <div className="bd-letter" onClick={() => setN(chars.length)}>
                <div className="bd-letter-scroll" ref={scroller}>
                    <p className={`bd-letter-greeting ${greet ? 'is-visible' : ''}`}>Dear {to},</p>
                    <div className="bd-letter-body">
                        {chars.slice(0, n).join('')}
                        {!done && <span className="bd-caret" />}
                    </div>
                </div>
                <button
                    type="button"
                    className={`bd-letter-next ${done ? 'is-on' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        next();
                    }}
                    aria-label="Continue"
                >
                    🎂
                </button>
            </div>
            {['✨', '✦', '✨', '✦'].map((s, i) => (
                <span key={i} className="bd-letter-twinkle" style={{ '--i': i }}>{s}</span>
            ))}
        </div>
    );
}
