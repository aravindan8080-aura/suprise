import { useState } from 'react';
import { sfx } from '../../Birthday/lib/audio';
import { heartBurst, sparkle } from '../../Birthday/lib/fx';

const MARKS = ['#F9B4C1', '#B9E3B5', '#F5A9A0', '#F2D28B'];
const INKS = ['#C53A5A', '#2F7A3B', '#B3332B', '#8A5A12'];

const HEART = [
    '..XXX...XXX..',
    '.XXXXX.XXXXX.',
    'XXXXXXXXXXXXX',
    'XXXXXXXXXXXXX',
    'XXXXXKKKXXXXX',
    '.XXXXKKKXXXX.',
    '..XXXXKXXXX..',
    '...XXXKXXX...',
    '....XXXXX....',
    '.....XXX.....',
    '......X......',
];

function PixelLock() {
    const px = [];
    HEART.forEach((row, y) =>
        [...row].forEach((ch, x) => {
            if (ch === '.') return;
            const light = x + y < 6;
            const shade = x + y > 15;
            const fill = ch === 'K' ? '#8E2B2B' : light ? '#FFD3A1' : shade ? '#D9823F' : '#F2A65E';
            px.push(<rect key={`${x}-${y}`} x={x} y={y + 6} width="1.02" height="1.02" fill={fill} />);
        }),
    );
    return (
        <svg viewBox="-1 0 15 18" className="pr-lock-svg" shapeRendering="crispEdges">
            <g className="pr-lock-shackle">
                <path d="M3.5 7 V3 H9.5 V7" fill="none" stroke="#E39A54" strokeWidth="1.4" />
                <path d="M3.2 3.4 H4.4" stroke="#FFE2BD" strokeWidth=".6" />
            </g>
            {px}
            <rect x="2" y="8" width="1" height="1" fill="#FFF3E0" />
        </svg>
    );
}

function Quote({ lines }) {
    let k = 0;
    return lines.map((line, li) => (
        <p key={li} className="pr-quote-line">
            {line.split(/(\[[^\]]+\])/).map((part, pi) => {
                if (!part.startsWith('[')) return <span key={pi}>{part}</span>;
                const i = k++;
                return (
                    <mark key={pi} className="pr-mark" style={{ '--m': MARKS[i % 4], '--ink': INKS[i % 4], '--d': `${0.5 + i * 0.45}s` }}>
                        {part.slice(1, -1)}
                    </mark>
                );
            })}
        </p>
    ));
}

// Scene 2 — "From me to you", the love quote with highlighter swipes, then
// a little pixel heart lock that opens the way in.
export default function Intro({ from, couplePhoto, quote, next }) {
    const [step, setStep] = useState(0); // 0 note → 1 quote → 2 lock → 3 unlocked
    const [failed, setFailed] = useState(!couplePhoto);

    const advance = (e) => {
        if (step < 2) {
            setStep(step + 1);
            sfx.tick();
            return;
        }
        if (step === 2) {
            setStep(3);
            sfx.pop();
            sfx.chime();
            sparkle(e.clientX, e.clientY, 40, '#FFD3A1');
            heartBurst(e.clientX, e.clientY, 36, 8);
            setTimeout(next, 1200);
        }
    };

    return (
        <div className={`pr-intro is-step-${step}`} onClick={advance}>
            {step === 0 && (
                <div className="pr-intro-note" key="note">
                    <h1 className="pr-script pr-intro-title">From me to you.</h1>
                    <p className="pr-intro-sub">This is how much I love you.</p>
                    <div className="pr-couple">
                        <div className="pr-couple-glow" />
                        {failed ? <span className="pr-couple-emoji">💑</span> : <img src={couplePhoto} alt="" onError={() => setFailed(true)} />}
                        <span className="pr-couple-heart">♥</span>
                    </div>
                    <p className="pr-dots">✦ ♡ ✦</p>
                    <p className="pr-hand pr-tap">tap to continue</p>
                </div>
            )}

            {step === 1 && (
                <div className="pr-quote-card" key="quote">
                    <span className="pr-deco pr-deco-1">♥</span>
                    <span className="pr-deco pr-deco-2">✿</span>
                    <span className="pr-deco pr-deco-3">✦</span>
                    <span className="pr-deco pr-deco-4">♥</span>
                    <Quote lines={quote} />
                    <p className="pr-quote-by">— {from}</p>
                </div>
            )}

            {step >= 2 && (
                <div className={`pr-lock ${step === 3 ? 'is-open' : ''}`} key="lock">
                    <div className="pr-lock-glow" />
                    <PixelLock />
                    <p className="pr-hand pr-lock-hint">{step === 3 ? 'unlocked ♡' : 'tap to open'}</p>
                </div>
            )}

            {step === 1 && <p className="pr-hand pr-tap pr-tap-fixed">tap to continue</p>}
        </div>
    );
}
