import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { sfx } from '../../Birthday/lib/audio';
import { confettiBurst, confettiRain, firework, heartBurst, sparkle } from '../../Birthday/lib/fx';

const NO_TEXTS = ['No', 'Are you sure?', 'Really sure? 🥺', 'Think again!', 'Pretty please 💕', "You're breaking my heart 💔", 'Okay, last chance…'];

// The last room — a ring box under a spotlight, the question, and a "No"
// button that really doesn't want to be pressed.
export default function Question({ to, question, next }) {
    const [phase, setPhase] = useState('box'); // box → open → yes
    const [noTries, setNoTries] = useState(0);
    const [noPos, setNoPos] = useState(null);
    const boxRef = useRef(null);

    const openBox = () => {
        if (phase !== 'box') return;
        setPhase('open');
        sfx.pop();
        setTimeout(() => {
            const r = boxRef.current.getBoundingClientRect();
            sparkle(r.left + r.width / 2, r.top + r.height * 0.3, 60, '#FFF3C4');
            sfx.chime();
        }, 500);
    };

    const dodge = (e) => {
        e?.preventDefault?.();
        setNoTries((n) => n + 1);
        sfx.tick();
        // Pick a spot on screen that doesn't cover the question or YES.
        const avoid = [...document.querySelectorAll('.pr-yes, .pr-q-text, .pr-ringbox')].map((el) => el.getBoundingClientRect());
        const hits = (x, y) => avoid.some((r) => x > r.left - 70 && x < r.right + 70 && y > r.top - 30 && y < r.bottom + 30);
        const padX = Math.min(90, innerWidth * 0.2);
        let spot;
        for (let k = 0; k < 40; k++) {
            spot = { x: padX + Math.random() * (innerWidth - padX * 2), y: 60 + Math.random() * (innerHeight - 120) };
            if (!hits(spot.x, spot.y)) break;
        }
        setNoPos(spot);
    };

    const yes = () => {
        setPhase('yes');
        sfx.pop();
        sfx.chime();
        heartBurst(innerWidth / 2, innerHeight / 2, 90, 14);
        confettiBurst(innerWidth / 2, innerHeight / 2, 200, { power: 16 });
        confettiRain(4000, 3);
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                firework();
                sfx.firework();
            }, 300 + i * 350);
        }
        setTimeout(next, 3000);
    };

    const noGone = noTries >= NO_TEXTS.length;
    const yesScale = 1 + Math.min(noTries, 6) * 0.12;

    const noButton = (
        <button
            type="button"
            className={`pr-no ${noPos ? 'is-running' : ''}`}
            style={noPos ? { left: noPos.x, top: noPos.y, transform: `translate(-50%, -50%) scale(${Math.max(0.55, 1 - noTries * 0.07)})` } : undefined}
            onPointerEnter={(e) => e.pointerType === 'mouse' && dodge(e)}
            onClick={dodge}
        >
            {NO_TEXTS[Math.min(noTries, NO_TEXTS.length - 1)]}
        </button>
    );

    let lead = `${to},`;
    if (phase === 'box') lead = `${to}, there's one last thing…`;
    if (phase === 'yes') lead = 'You said yes!! 💍';

    return (
        <div className={`pr-question is-${phase}`}>
            <div className="pr-spotlight" />

            <p className="pr-q-lead">{lead}</p>

            <div className="pr-ringbox" ref={boxRef} onClick={openBox}>
                <div className="pr-ringbox-base">
                    <div className="pr-cushion">
                        <span className="pr-ring">💍</span>
                        <span className="pr-glint" />
                    </div>
                </div>
                <div className="pr-ringbox-lid">
                    <div className="pr-ringbox-lid-inner" />
                </div>
            </div>

            {phase === 'box' && <p className="pr-hand pr-hint-light">tap the box</p>}

            {phase !== 'box' && (
                <h1 className="pr-q-text">
                    {question.split('').map((ch, i) => (
                        <span key={i} style={{ '--d': `${0.9 + i * 0.05}s` }}>
                            {ch === ' ' ? ' ' : ch}
                        </span>
                    ))}
                </h1>
            )}

            {phase === 'open' && (
                <div className="pr-answers" style={{ '--d': `${1.2 + question.length * 0.05}s` }}>
                    <button type="button" className="pr-yes" style={{ transform: `scale(${yesScale})` }} onClick={yes}>
                        YES 💖
                    </button>
                    {/* Once it starts running it lives on <body>: the animated
                        scene wrappers would otherwise trap position: fixed. */}
                    {!noGone && (noPos ? createPortal(<div className="pr-root">{noButton}</div>, document.body) : noButton)}
                </div>
            )}
        </div>
    );
}
