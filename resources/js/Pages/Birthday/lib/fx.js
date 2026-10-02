// One full-screen canvas shared by every scene for particle effects:
// confetti, heart bursts, balloon bits, sparkles and fireworks. The loop
// only runs while particles are alive.

const CONFETTI_COLORS = ['#FF6F52', '#FFB65C', '#FF8FB1', '#A78BFA', '#39D0C4', '#F6C453', '#FFFFFF'];
const HEART_COLORS = ['#FF5C9A', '#FF8FB1', '#FFB3CF', '#FF6F52', '#F6C453', '#E0256B'];

let canvas = null;
let ctx = null;
let dpr = 1;
let particles = [];
let rockets = [];
let raf = null;

function ensure() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.className = 'bd-fx-canvas';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
}

function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
}

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

export function heartPath(c, x, y, s) {
    // A heart of width ~2s centred on (x, y).
    c.beginPath();
    c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.6, y - s * 0.1, x - s * 0.9, y - s * 1.35, x, y - s * 0.55);
    c.bezierCurveTo(x + s * 0.9, y - s * 1.35, x + s * 1.6, y - s * 0.1, x, y + s * 0.9);
    c.closePath();
}

function loop() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.04;
        r.trail.push([r.x, r.y]);
        if (r.trail.length > 10) r.trail.shift();
        ctx.strokeStyle = 'rgba(255,230,190,.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        r.trail.forEach(([tx, ty], k) => (k ? ctx.lineTo(tx, ty) : ctx.moveTo(tx, ty)));
        ctx.stroke();
        if (r.vy >= -0.6 || r.y <= r.ty) {
            rockets.splice(i, 1);
            explode(r.x, r.y, r.color);
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.g;
        p.x += p.vx + (p.sway ? Math.sin(p.life * 0.05 + p.phase) * p.sway : 0);
        p.y += p.vy;
        p.rot += p.vr;
        const k = p.life / p.max;
        const alpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
        if (p.life >= p.max || p.y > innerHeight + 40) {
            particles.splice(i, 1);
            continue;
        }
        ctx.globalAlpha = Math.max(0, alpha) * (p.alpha ?? 1);
        ctx.fillStyle = p.color;
        if (p.kind === 'confetti') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            // Fake 3D flip: squash the width with a cosine.
            ctx.scale(Math.cos(p.life * p.flip), 1);
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        } else if (p.kind === 'heart') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * 0.3);
            heartPath(ctx, 0, 0, p.size);
            ctx.fill();
            ctx.globalAlpha *= 0.55;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(-p.size * 0.45, -p.size * 0.45, p.size * 0.28, p.size * 0.16, -0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (p.kind === 'emoji') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.font = `${p.size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.text, 0, 0);
            ctx.restore();
        } else if (p.kind === 'spark') {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
            ctx.stroke();
            ctx.restore();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1;

    if (particles.length || rockets.length) {
        raf = requestAnimationFrame(loop);
    } else {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        raf = null;
    }
}

function kick() {
    if (!raf) raf = requestAnimationFrame(loop);
}

function add(p) {
    particles.push({ life: 0, rot: 0, vr: 0, drag: 0.985, g: 0.12, phase: Math.random() * 6, ...p });
}

/** A fountain of confetti from a point. */
export function confettiBurst(x, y, count = 120, { power = 11, spread = Math.PI * 2, angle = -Math.PI / 2 } = {}) {
    ensure();
    for (let i = 0; i < count; i++) {
        const a = angle + rand(-spread / 2, spread / 2);
        const v = rand(power * 0.35, power);
        add({
            kind: Math.random() < 0.75 ? 'confetti' : 'dot',
            x, y,
            vx: Math.cos(a) * v,
            vy: Math.sin(a) * v,
            w: rand(6, 11), h: rand(3, 6), size: rand(2, 4),
            vr: rand(-0.2, 0.2), flip: rand(0.08, 0.2),
            color: pick(CONFETTI_COLORS),
            g: 0.16, drag: 0.975, sway: rand(0, 0.8),
            max: rand(140, 220),
        });
    }
    kick();
}

/** Confetti falling from the top of the screen for a while. */
export function confettiRain(ms = 3000, perFrame = 3) {
    ensure();
    const end = performance.now() + ms;
    const drip = () => {
        for (let i = 0; i < perFrame; i++) {
            add({
                kind: 'confetti',
                x: rand(0, innerWidth), y: -10,
                vx: rand(-1, 1), vy: rand(1, 3),
                w: rand(6, 10), h: rand(3, 6),
                vr: rand(-0.1, 0.1), flip: rand(0.05, 0.15),
                color: pick(CONFETTI_COLORS),
                g: 0.03, drag: 0.995, sway: rand(0.3, 1.2),
                max: 600,
            });
        }
        kick();
        if (performance.now() < end) requestAnimationFrame(drip);
    };
    drip();
}

/** Glossy hearts exploding outward. */
export function heartBurst(x, y, count = 40, power = 9) {
    ensure();
    for (let i = 0; i < count; i++) {
        const a = rand(0, Math.PI * 2);
        const v = rand(power * 0.3, power);
        add({
            kind: 'heart', x, y,
            vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2,
            size: rand(5, 13), vr: rand(-0.1, 0.1),
            color: pick(HEART_COLORS), g: 0.1, drag: 0.97, max: rand(90, 150),
        });
    }
    kick();
}

/** Emoji flying out of a point (candy from a piñata, party faces…). */
export function emojiBurst(x, y, emojis, count = 30, power = 12) {
    ensure();
    for (let i = 0; i < count; i++) {
        const a = rand(-Math.PI, 0) + rand(-0.3, 0.3);
        const v = rand(power * 0.35, power);
        add({
            kind: 'emoji', text: pick(emojis), x, y,
            vx: Math.cos(a) * v, vy: Math.sin(a) * v,
            size: rand(18, 34), vr: rand(-0.15, 0.15),
            g: 0.28, drag: 0.985, max: rand(110, 170),
        });
    }
    kick();
}

/** Small round bits in one colour — balloon pops. */
export function bits(x, y, color, count = 18) {
    ensure();
    for (let i = 0; i < count; i++) {
        const a = rand(0, Math.PI * 2);
        const v = rand(2, 8);
        add({
            kind: Math.random() < 0.5 ? 'confetti' : 'dot', x, y,
            vx: Math.cos(a) * v, vy: Math.sin(a) * v,
            w: rand(4, 9), h: rand(3, 5), size: rand(1.5, 3.5),
            vr: rand(-0.3, 0.3), flip: rand(0.1, 0.3),
            color, g: 0.18, drag: 0.95, max: rand(50, 80),
        });
    }
    kick();
}

/** Twinkly sparks — for magic moments. */
export function sparkle(x, y, count = 24, color = '#FFE3A3') {
    ensure();
    for (let i = 0; i < count; i++) {
        const a = rand(0, Math.PI * 2);
        const v = rand(1, 5);
        add({ kind: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, size: rand(1, 2.4), color, g: 0.02, drag: 0.94, max: rand(30, 60) });
    }
    kick();
}

function explode(x, y, color) {
    const n = 70;
    const ring = Math.random() < 0.35;
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand(-0.05, 0.05);
        const v = ring ? 5.5 : rand(1.5, 6.5);
        add({
            kind: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
            size: rand(1.4, 2.6), color: Math.random() < 0.2 ? '#FFFFFF' : color,
            g: 0.05, drag: 0.965, max: rand(60, 95),
        });
    }
    // Lingering glitter.
    for (let i = 0; i < 20; i++) {
        add({ kind: 'dot', x: x + rand(-50, 50), y: y + rand(-50, 50), vx: 0, vy: rand(0.2, 0.8), size: rand(0.8, 1.6), color: '#FFE9C2', g: 0.005, drag: 0.99, max: rand(80, 140) });
    }
}

/** A firework rocket launched from the bottom, exploding near (tx, ty). */
export function firework(tx = rand(innerWidth * 0.15, innerWidth * 0.85), ty = rand(innerHeight * 0.12, innerHeight * 0.45)) {
    ensure();
    const x = tx + rand(-60, 60);
    const y = innerHeight + 10;
    const frames = 55;
    rockets.push({
        x, y, tx, ty,
        vx: (tx - x) / frames,
        vy: -Math.sqrt(2 * 0.04 * (y - ty)),
        trail: [],
        color: pick(['#FFB65C', '#FF8FB1', '#A78BFA', '#39D0C4', '#FF6F52', '#F6C453']),
    });
    kick();
}

export function clearFx() {
    particles = [];
    rockets = [];
}
