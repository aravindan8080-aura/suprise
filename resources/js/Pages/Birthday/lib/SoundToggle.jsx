import { useEffect, useState } from 'react';
import { isMuted, onMuteChange, setMuted } from './audio';

export default function SoundToggle({ light }) {
    const [muted, setM] = useState(isMuted());
    useEffect(() => onMuteChange(setM), []);

    return (
        <button
            type="button"
            className={`bd-sound ${light ? 'is-light' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                setMuted(!muted);
            }}
            aria-label={muted ? 'Unmute' : 'Mute'}
        >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
                {muted ? (
                    <>
                        <path d="m17 9 5 5" />
                        <path d="m22 9-5 5" />
                    </>
                ) : (
                    <>
                        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                        <path d="M18.5 5.5a9 9 0 0 1 0 13" className="bd-sound-wave" />
                    </>
                )}
            </svg>
        </button>
    );
}
