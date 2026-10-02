// All sound for the surprise: background music plus small sound effects.
// Browsers only allow audio after a user gesture, so nothing plays until
// start() is called from the "Unwrap it" click.
//
// Music is the configured mp3 when there is one; otherwise a soft
// music-box "Happy Birthday" is synthesised with WebAudio so the page
// always has a soundtrack.

let ctx = null;
let master = null;
let musicGain = null;
let sfxGain = null;
let mp3 = null;
let muted = false;
let started = false;
let synthTimer = null;
const listeners = new Set();

function ensureCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);

    // A short feedback delay gives the music box a little room sound.
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.16;
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.28;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    musicGain.connect(master);
    musicGain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(master);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.5;
    sfxGain.connect(master);
    return ctx;
}

const NOTE = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };

// [note, beats] — 3/4 time.
const MELODY = [
    ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
    ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
    ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
    ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3],
    [null, 3],
];
// Seconds per beat; start() can speed it up (the friend page is bouncier).
let BEAT = 0.62;

function chimeAt(freq, t, dur, gainNode, level = 0.5) {
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o1.type = 'sine';
    o2.type = 'triangle';
    o1.frequency.value = freq;
    o2.frequency.value = freq * 2;
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    o1.connect(g);
    o2.connect(g2).connect(g);
    g.connect(gainNode);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o1.start(t);
    o2.start(t);
    o1.stop(t + dur + 0.05);
    o2.stop(t + dur + 0.05);
}

function playSynthLoop() {
    let t = ctx.currentTime + 0.15;
    let i = 0;
    const schedule = () => {
        // Keep ~1.5s of notes scheduled ahead of the clock.
        while (t < ctx.currentTime + 1.5) {
            const [n, beats] = MELODY[i % MELODY.length];
            if (n) {
                chimeAt(NOTE[n], t, Math.max(1.2, beats * BEAT * 1.6), musicGain, 0.55);
                // Soft lower octave on the downbeats for warmth.
                if (beats >= 1) chimeAt(NOTE[n] / 2, t, beats * BEAT * 1.4, musicGain, 0.18);
            }
            t += beats * BEAT;
            i++;
        }
        synthTimer = setTimeout(schedule, 300);
    };
    schedule();
}

export function start(musicUrl, { beat } = {}) {
    if (started) return;
    started = true;
    if (beat) BEAT = beat;
    ensureCtx();
    if (ctx?.state === 'suspended') ctx.resume();

    if (musicUrl) {
        mp3 = new Audio(musicUrl);
        mp3.loop = true;
        mp3.volume = 0;
        mp3.muted = muted;
        mp3.play().then(() => fadeMp3(0.55)).catch(() => {
            mp3 = null;
            if (ctx) playSynthLoop();
        });
    } else if (ctx) {
        playSynthLoop();
    }
}

function fadeMp3(to) {
    if (!mp3) return;
    const from = mp3.volume;
    const t0 = performance.now();
    const step = (now) => {
        const k = Math.min(1, (now - t0) / 1500);
        mp3.volume = from + (to - from) * k;
        if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

export function isMuted() {
    return muted;
}

export function setMuted(value) {
    muted = value;
    if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.05);
    if (mp3) mp3.muted = muted;
    listeners.forEach((fn) => fn(muted));
}

export function onMuteChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

/* ---------------------------- sound effects ---------------------------- */

function noiseBurst(dur, filterFreq, level, type = 'bandpass') {
    if (!ensureCtx() || !started) return;
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = filterFreq;
    const g = ctx.createGain();
    g.gain.value = level;
    src.connect(f).connect(g).connect(sfxGain);
    src.start(t);
}

export const sfx = {
    pop() {
        noiseBurst(0.18, 1200, 1.4);
        noiseBurst(0.06, 4000, 0.6, 'highpass');
    },
    whoosh() {
        if (!ensureCtx() || !started) return;
        const t = ctx.currentTime;
        const len = Math.floor(ctx.sampleRate * 0.45);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.Q.value = 1.2;
        f.frequency.setValueAtTime(400, t);
        f.frequency.exponentialRampToValueAtTime(2600, t + 0.4);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.5, t + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        src.connect(f).connect(g).connect(sfxGain);
        src.start(t);
    },
    thunk() {
        if (!ensureCtx() || !started) return;
        const t = ctx.currentTime;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(180, t);
        o.frequency.exponentialRampToValueAtTime(60, t + 0.15);
        g.gain.setValueAtTime(0.8, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.connect(g).connect(sfxGain);
        o.start(t);
        o.stop(t + 0.25);
    },
    // Rising sparkle arpeggio — used for reveals.
    chime() {
        if (!ensureCtx() || !started) return;
        const t = ctx.currentTime;
        [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C5 * 2].forEach((f, i) => chimeAt(f, t + i * 0.07, 0.9, sfxGain, 0.25));
    },
    blow() {
        noiseBurst(0.7, 700, 0.9, 'lowpass');
    },
    tick() {
        if (!ensureCtx() || !started) return;
        chimeAt(1800 + Math.random() * 400, ctx.currentTime, 0.05, sfxGain, 0.03);
    },
    firework() {
        noiseBurst(0.5, 300, 1.1, 'lowpass');
        setTimeout(() => noiseBurst(0.9, 5000, 0.25, 'highpass'), 60);
    },
};
