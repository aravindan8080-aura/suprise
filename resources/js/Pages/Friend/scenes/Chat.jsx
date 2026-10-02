import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../Birthday/lib/audio';
import { emojiBurst } from '../../Birthday/lib/fx';

const time = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Scene 6 — a chat from you that types itself out, WhatsApp-style. The
// birthday person "replies" with a hug to continue.
export default function Chat({ to, from, chat, next }) {
    const [shown, setShown] = useState(0);
    const [typing, setTyping] = useState(false);
    const [replied, setReplied] = useState(false);
    const listRef = useRef(null);
    const done = shown >= chat.length;

    useEffect(() => {
        if (done) return;
        const msg = chat[shown];
        setTyping(true);
        const typeFor = Math.min(2200, 700 + msg.length * 22);
        const t = setTimeout(() => {
            setTyping(false);
            setShown((n) => n + 1);
            sfx.tick();
        }, shown === 0 ? 1200 : typeFor);
        return () => clearTimeout(t);
    }, [shown, done]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, [shown, typing, replied]);

    const reply = () => {
        if (replied) return;
        setReplied(true);
        sfx.pop();
        setTimeout(() => {
            const r = listRef.current.getBoundingClientRect();
            emojiBurst(r.right - 60, r.bottom - 40, ['🤗', '❤️', '🫂', '😂'], 24, 11);
            sfx.chime();
        }, 300);
        setTimeout(next, 1800);
    };

    return (
        <div className="fr-chat-scene">
            <div className="fr-phone bd-rise" style={{ '--d': '0.15s' }}>
                <div className="fr-phone-head">
                    <span className="fr-avatar">{from.slice(0, 1).toUpperCase()}</span>
                    <div>
                        <b>{from}</b>
                        <small>{typing ? 'typing…' : 'online'}</small>
                    </div>
                    <span className="fr-phone-icons">📹 📞</span>
                </div>

                <div className="fr-chat" ref={listRef}>
                    <p className="fr-chat-day">TODAY</p>
                    {chat.slice(0, shown).map((m, i) => (
                        <div key={i} className="fr-bubble fr-bubble-in">
                            {m}
                            <span className="fr-bubble-time">{time()}</span>
                        </div>
                    ))}
                    {typing && (
                        <div className="fr-bubble fr-bubble-in fr-typing">
                            <i />
                            <i />
                            <i />
                        </div>
                    )}
                    {replied && (
                        <div className="fr-bubble fr-bubble-out">
                            🤗🤗🤗 love you too!
                            <span className="fr-bubble-time">{time()} <b className="fr-ticks">✓✓</b></span>
                        </div>
                    )}
                </div>

                <div className="fr-phone-input">
                    {done && !replied ? (
                        <button type="button" className="fr-reply" onClick={reply}>
                            Send {from} a hug back 🤗
                        </button>
                    ) : (
                        <span className="fr-input-fake">{replied ? 'sent ✓' : `Message ${from}…`}</span>
                    )}
                </div>
            </div>
            <p className="fr-hint">a message for {to} 💬</p>
        </div>
    );
}
