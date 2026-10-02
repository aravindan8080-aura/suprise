import { useEffect, useRef } from 'react';

// The living background behind every scene: twinkling, slowly drifting
// stars with the odd shooting star, plus soft colour blobs (CSS). The
// cream "light" variant (bow & tree scenes) cross-fades over the night sky.
export default function Backdrop({ light }) {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        const c = canvas.getContext('2d');
        let w, h, dpr, stars, raf;
        let shooting = null;
        let nextShoot = performance.now() + 4000;

        const init = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.width = innerWidth * dpr;
            h = canvas.height = innerHeight * dpr;
            const count = Math.round((innerWidth * innerHeight) / 7000);
            stars = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: (Math.random() * 1.3 + 0.3) * dpr,
                tw: Math.random() * Math.PI * 2,
                sp: 0.01 + Math.random() * 0.03,
                dy: (0.02 + Math.random() * 0.06) * dpr,
            }));
        };

        const draw = (now) => {
            c.clearRect(0, 0, w, h);
            for (const s of stars) {
                s.tw += s.sp;
                s.y -= s.dy;
                if (s.y < -2) s.y = h + 2;
                const a = 0.35 + Math.sin(s.tw) * 0.35 + 0.3;
                c.globalAlpha = Math.max(0.05, a);
                c.fillStyle = '#FFF4E6';
                c.beginPath();
                c.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                c.fill();
                if (s.r > 1.3 * dpr && a > 0.85) {
                    // Little cross glint on the brightest stars.
                    c.globalAlpha = (a - 0.85) * 3;
                    c.fillRect(s.x - s.r * 3, s.y - 0.4 * dpr, s.r * 6, 0.8 * dpr);
                    c.fillRect(s.x - 0.4 * dpr, s.y - s.r * 3, 0.8 * dpr, s.r * 6);
                }
            }

            if (!shooting && now > nextShoot) {
                shooting = { x: Math.random() * w * 0.7 + w * 0.2, y: Math.random() * h * 0.3, l: 0 };
                nextShoot = now + 5000 + Math.random() * 7000;
            }
            if (shooting) {
                shooting.l += 1;
                const t = shooting.l;
                const x = shooting.x - t * 9 * dpr;
                const y = shooting.y + t * 4.5 * dpr;
                const g = c.createLinearGradient(x, y, x + 120 * dpr, y - 60 * dpr);
                g.addColorStop(0, 'rgba(255,240,220,.9)');
                g.addColorStop(1, 'rgba(255,240,220,0)');
                c.globalAlpha = Math.max(0, 1 - t / 60);
                c.strokeStyle = g;
                c.lineWidth = 1.5 * dpr;
                c.beginPath();
                c.moveTo(x, y);
                c.lineTo(x + 120 * dpr, y - 60 * dpr);
                c.stroke();
                if (t > 60) shooting = null;
            }
            c.globalAlpha = 1;
            raf = requestAnimationFrame(draw);
        };

        init();
        raf = requestAnimationFrame(draw);
        window.addEventListener('resize', init);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', init);
        };
    }, []);

    return (
        <div className="bd-backdrop" aria-hidden="true">
            <div className="bd-night">
                <div className="bd-blob bd-blob-1" />
                <div className="bd-blob bd-blob-2" />
                <div className="bd-blob bd-blob-3" />
                <canvas ref={ref} className="bd-stars" />
            </div>
            <div className={`bd-day ${light ? 'is-on' : ''}`}>
                <div className="bd-blob bd-blob-day-1" />
                <div className="bd-blob bd-blob-day-2" />
            </div>
        </div>
    );
}
