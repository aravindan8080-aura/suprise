// Bright party backdrop: a deep violet gradient with Memphis-style shapes
// (rings, triangles, squiggles, plus signs, dot grids) drifting and spinning.
const COLORS = ['#FFD23F', '#3BCEAC', '#EE4266', '#5B8CFF', '#FF8C42', '#B388FF'];
const KINDS = ['ring', 'tri', 'squiggle', 'plus', 'dots', 'pill', 'ring', 'tri', 'squiggle', 'plus', 'pill', 'dots', 'ring', 'squiggle'];

function Shape({ kind, color }) {
    switch (kind) {
        case 'ring':
            return <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill="none" stroke={color} strokeWidth="6" /></svg>;
        case 'tri':
            return <svg viewBox="0 0 40 40"><path d="M20 4 L37 34 H3 Z" fill={color} /></svg>;
        case 'squiggle':
            return <svg viewBox="0 0 60 20"><path d="M2 10 Q 9 0 16 10 T 30 10 T 44 10 T 58 10" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" /></svg>;
        case 'plus':
            return <svg viewBox="0 0 40 40"><path d="M20 6 V34 M6 20 H34" stroke={color} strokeWidth="8" strokeLinecap="round" /></svg>;
        case 'pill':
            return <svg viewBox="0 0 60 24"><rect x="2" y="2" width="56" height="20" rx="10" fill={color} /></svg>;
        default:
            return (
                <svg viewBox="0 0 40 40">
                    {[8, 20, 32].flatMap((x) => [8, 20, 32].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill={color} />))}
                </svg>
            );
    }
}

export default function Backdrop() {
    return (
        <div className="fr-backdrop" aria-hidden="true">
            <div className="fr-glow fr-glow-1" />
            <div className="fr-glow fr-glow-2" />
            <div className="fr-glow fr-glow-3" />
            {KINDS.map((kind, i) => (
                <span
                    key={i}
                    className="fr-shape"
                    style={{
                        left: `${(i * 37 + 7) % 96}%`,
                        top: `${(i * 53 + 11) % 92}%`,
                        width: `${28 + ((i * 13) % 30)}px`,
                        '--dur': `${14 + (i % 5) * 4}s`,
                        '--delay': `${-i * 1.7}s`,
                        '--spin': i % 2 ? '360deg' : '-360deg',
                    }}
                >
                    <Shape kind={kind} color={COLORS[i % COLORS.length]} />
                </span>
            ))}
        </div>
    );
}
