import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/audio';
import { heartPath } from '../lib/fx';

const PALETTE = ['#FF5C9A', '#FF7BAC', '#FF9CC0', '#FFB3CF', '#F2387A', '#FF8A5B', '#FFA36C', '#F6B43C', '#F9C74F', '#E8508A'];

const easeOutBack = (k) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Pre-rendered glossy heart sprite per colour (drawn once, stamped many times).
function makeSprite(color) {
    const s = 64;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(s * 0.36, s * 0.3, 2, s * 0.5, s * 0.5, s * 0.6);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.18, color);
    grad.addColorStop(1, shade(color, -0.28));
    g.fillStyle = grad;
    heartPath(g, s / 2, s / 2 + 2, s * 0.34);
    g.fill();
    g.globalAlpha = 0.7;
    g.fillStyle = '#fff';
    g.beginPath();
    g.ellipse(s * 0.33, s * 0.3, s * 0.09, s * 0.05, -0.6, 0, Math.PI * 2);
    g.fill();
    return c;
}

function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v + v * amt)));
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

function bezierPoint(p0, p1, p2, p3, t) {
    const u = 1 - t;
    return {
        x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
        y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    };
}

function useTogether(since) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    if (!since) return null;
    const start = new Date(String(since).replace(' ', 'T')).getTime();
    if (Number.isNaN(start)) return null;
    let s = Math.max(0, Math.floor((now - start) / 1000));
    const days = Math.floor(s / 86400);
    s -= days * 86400;
    const hours = Math.floor(s / 3600);
    s -= hours * 3600;
    const mins = Math.floor(s / 60);
    return { days, hours, mins, secs: s - mins * 60 };
}

// Scene 3 — a tree grows and blooms into a heart made of hearts.
export default function Tree({ age, togetherSince, next }) {
    const canvasRef = useRef(null);
    const copyRef = useRef(null);
    const [canTap, setCanTap] = useState(false);
    const together = useTogether(togetherSince);

    useEffect(() => {
        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');
        const sprites = PALETTE.map(makeSprite);
        let w, h, dpr, layout, hearts, raf;
        const falling = [];
        const t0 = performance.now();
        let lastSpawn = 0;
        let chimed = false;

        const build = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = innerWidth;
            h = innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            const mobile = w < 768;
            const tx = mobile ? w / 2 : w * 0.6;
            let R;
            let cy;
            if (mobile) {
                // Phones: the text panel sits at the bottom, so fit the whole
                // canopy (~1.36R above its centre, ~1.1R below incl. heart
                // sprites) between the top bar and the panel.
                const panelTop = copyRef.current ? copyRef.current.getBoundingClientRect().top : h * 0.6;
                const space = Math.max(160, panelTop - 12 - 48);
                R = Math.min(w * 0.4, space / 2.46);
                cy = 48 + R * 1.36;
            } else {
                R = Math.min(w * 0.22, h * 0.28);
                // Keep the top of the canopy (~1.25R above centre) on screen.
                cy = Math.max(R * 1.25 + 24, h * 0.34);
            }
            const top = { x: tx, y: cy + R * 0.35 };
            layout = {
                tx, R, cy, top,
                trunk: [{ x: tx, y: h + 10 }, { x: tx - R * 0.12, y: h * 0.78 }, { x: tx + R * 0.1, y: cy + R * 0.9 }, top],
                branches: [
                    [-0.55, -0.05], [0.55, -0.05], [-0.28, -0.55], [0.28, -0.55], [0, -0.3], [-0.75, 0.25], [0.75, 0.25],
                ].map(([bx, by]) => {
                    const end = { x: tx + bx * R, y: cy + by * R };
                    return [top, { x: top.x + (end.x - top.x) * 0.3, y: top.y - R * 0.1 }, { x: end.x, y: end.y + R * 0.15 }, end];
                }),
            };

            if (!hearts) {
                // Rejection-sample points inside the classic implicit heart
                // curve (x²+y²−1)³ − x²y³ ≤ 0, then bloom them from the trunk out.
                const pts = [];
                const count = mobile ? 230 : 320;
                while (pts.length < count) {
                    const x = Math.random() * 2.6 - 1.3;
                    const y = Math.random() * 2.6 - 1.25;
                    const a = x * x + y * y - 1;
                    if (a * a * a - x * x * y * y * y <= 0) pts.push({ ux: x, uy: y });
                }
                hearts = pts.map((p, i) => ({
                    ...p,
                    size: 0.06 + Math.random() * 0.08,
                    sprite: sprites[(Math.random() * sprites.length) | 0],
                    rot: (Math.random() - 0.5) * 0.9,
                    phase: Math.random() * Math.PI * 2,
                    jitter: Math.random() * 380,
                    i,
                }));
                hearts.forEach((p) => {
                    p.dist = Math.hypot(p.ux, p.uy + 0.35);
                });
                const maxD = Math.max(...hearts.map((p) => p.dist));
                hearts.forEach((p) => {
                    p.start = 1700 + (p.dist / maxD) * 2600 + p.jitter;
                });
                hearts.sort((a, b) => a.uy - b.uy); // back to front
            }
        };

        const heartPos = (p) => ({ x: layout.tx + p.ux * layout.R, y: layout.cy - p.uy * layout.R * 0.95 });

        const strokeCurve = (pts, prog, w0, w1, color) => {
            const steps = 40;
            const n = Math.floor(steps * prog);
            c.strokeStyle = color;
            c.lineCap = 'round';
            let prev = pts[0];
            for (let i = 1; i <= n; i++) {
                const p = bezierPoint(...pts, i / steps);
                c.lineWidth = w0 + (w1 - w0) * (i / steps);
                c.beginPath();
                c.moveTo(prev.x, prev.y);
                c.lineTo(p.x, p.y);
                c.stroke();
                prev = p;
            }
        };

        const draw = (now) => {
            const t = now - t0;
            const { R, tx, cy } = layout;
            c.setTransform(dpr, 0, 0, dpr, 0, 0);
            c.clearRect(0, 0, w, h);

            // Warm glow behind the canopy, fading in with the bloom.
            const glowK = clamp01((t - 1600) / 2500);
            if (glowK > 0) {
                const g = c.createRadialGradient(tx, cy, R * 0.2, tx, cy, R * 1.9);
                g.addColorStop(0, `rgba(255,236,200,${0.75 * glowK})`);
                g.addColorStop(1, 'rgba(255,236,200,0)');
                c.fillStyle = g;
                c.fillRect(0, 0, w, h);
            }

            // Trunk then branches.
            const trunkW = Math.max(10, R * 0.13);
            strokeCurve(layout.trunk, clamp01(t / 1400), trunkW, trunkW * 0.45, '#5B3442');
            const bk = clamp01((t - 1100) / 900);
            if (bk > 0) layout.branches.forEach((b) => strokeCurve(b, bk, trunkW * 0.42, 1.5, '#5B3442'));

            // Canopy breathing.
            const breath = t > 4800 ? 1 + Math.sin((t - 4800) / 900) * 0.018 : 1;
            c.save();
            c.translate(tx, cy);
            c.scale(breath, breath);
            c.translate(-tx, -cy);
            for (const p of hearts) {
                const k = clamp01((t - p.start) / 520);
                if (k <= 0) continue;
                const { x, y } = heartPos(p);
                const s = p.size * R * 1.25 * easeOutBack(k);
                const sway = Math.sin(t / 700 + p.phase) * 0.06;
                c.save();
                c.translate(x, y);
                c.rotate(p.rot + sway);
                c.globalAlpha = clamp01(k * 2);
                c.drawImage(p.sprite, -s, -s, s * 2, s * 2);
                c.restore();
            }
            c.restore();

            if (!chimed && t > 4300) {
                chimed = true;
                sfx.chime();
            }

            // Twinkles across the canopy.
            if (t > 4600) {
                for (let i = 0; i < 6; i++) {
                    const p = hearts[(i * 53 + Math.floor(t / 900) * 7) % hearts.length];
                    const { x, y } = heartPos(p);
                    const a = Math.max(0, Math.sin(t / 300 + i * 1.7));
                    c.globalAlpha = a;
                    c.fillStyle = '#FFFDF5';
                    const r = 6 * a + 2;
                    c.beginPath();
                    c.moveTo(x, y - r);
                    c.quadraticCurveTo(x, y, x + r, y);
                    c.quadraticCurveTo(x, y, x, y + r);
                    c.quadraticCurveTo(x, y, x - r, y);
                    c.quadraticCurveTo(x, y, x, y - r);
                    c.fill();
                }
                c.globalAlpha = 1;
            }

            // Hearts drifting off the tree.
            if (t > 4200 && now - lastSpawn > 260) {
                lastSpawn = now;
                const p = hearts[(Math.random() * hearts.length) | 0];
                const { x, y } = heartPos(p);
                falling.push({ x, y, vx: (Math.random() - 0.3) * 0.8, vy: 0.5 + Math.random() * 0.8, s: p.size * R, sprite: p.sprite, rot: p.rot, vr: (Math.random() - 0.5) * 0.03, ph: Math.random() * 6 });
            }
            for (let i = falling.length - 1; i >= 0; i--) {
                const f = falling[i];
                f.x += f.vx + Math.sin(now / 600 + f.ph) * 0.6;
                f.y += f.vy;
                f.rot += f.vr;
                if (f.y > h + 30) {
                    falling.splice(i, 1);
                    continue;
                }
                c.save();
                c.translate(f.x, f.y);
                c.rotate(f.rot);
                c.globalAlpha = 0.9;
                c.drawImage(f.sprite, -f.s, -f.s, f.s * 2, f.s * 2);
                c.restore();
            }

            raf = requestAnimationFrame(draw);
        };

        build();
        raf = requestAnimationFrame(draw);
        window.addEventListener('resize', build);
        const tap = setTimeout(() => setCanTap(true), 5600);
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(tap);
            window.removeEventListener('resize', build);
        };
    }, []);

    return (
        <div className={`bd-tree ${canTap ? 'can-tap' : ''}`} onClick={() => canTap && next()}>
            <canvas ref={canvasRef} className="bd-tree-canvas" />
            <div className="bd-tree-copy" ref={copyRef}>
                <h2 className="bd-tree-write" style={{ '--d': '1.2s' }}>it's officially your day</h2>
                {together && (
                    <div className="bd-together bd-rise" style={{ '--d': '2.6s' }}>
                        <p className="bd-together-label">we've been together for</p>
                        <div className="bd-together-tiles">
                            {[
                                [together.days, 'days'],
                                [together.hours, 'hours'],
                                [together.mins, 'mins'],
                                [together.secs, 'secs'],
                            ].map(([v, l]) => (
                                <div key={l} className="bd-tile">
                                    <span key={v} className="bd-tile-num">{String(v).padStart(2, '0')}</span>
                                    <span className="bd-tile-lbl">{l}</span>
                                </div>
                            ))}
                        </div>
                        <p className="bd-together-foot">…and I'd choose you in every single one of them 💞</p>
                    </div>
                )}
                <h3 className="bd-tree-write bd-tree-age" style={{ '--d': '4.2s' }}>
                    and just like that, you're turning {age} ✨
                </h3>
            </div>
            <p className="bd-tap-hint">tap anywhere to continue</p>
        </div>
    );
}
