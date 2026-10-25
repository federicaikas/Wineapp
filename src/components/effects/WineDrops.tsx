import { useEffect, useRef } from 'react';

/**
 * Effetto globale al passaggio del mouse: gocce di vino che si staccano dal puntatore,
 * cadono per un breve tratto e vengono assorbite dallo sfondo (la macchia si allarga e si asciuga).
 * Disattivato su touch e con "riduci animazioni". Disegna su un canvas fisso, senza intercettare i clic.
 */

interface Drop {
  x: number;
  y: number;
  vy: number;
  r: number;
  landY: number;
  hue: string;
  state: 'fall' | 'stain';
  age: number; // secondi dalla caduta
  stainR: number;
  rot: number;
}

const COLORS = ['108, 26, 36', '139, 35, 50', '71, 17, 24', '159, 0, 0'];
const MAX_DROPS = 70;
const GRAVITY = 1500; // px/s^2
const STAIN_LIFE = 1.9; // secondi per asciugare

export const WineDrops: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (reduce || !finePointer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const drops: Drop[] = [];
    let raf = 0;
    let last = 0;
    let lastSpawnX = -999;
    let lastSpawnY = -999;
    let lastSpawnT = 0;

    const spawn = (x: number, y: number) => {
      if (drops.length >= MAX_DROPS) return;
      const fall = 45 + Math.random() * 85;
      drops.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + 6,
        vy: 30 + Math.random() * 60,
        r: 1.8 + Math.random() * 2.2,
        landY: Math.min(y + 6 + fall, window.innerHeight - 4),
        hue: COLORS[Math.floor(Math.random() * COLORS.length)],
        state: 'fall',
        age: 0,
        stainR: 8 + Math.random() * 9,
        rot: Math.random() * Math.PI,
      });
    };

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const dist = Math.hypot(e.clientX - lastSpawnX, e.clientY - lastSpawnY);
      if (dist > 34 && now - lastSpawnT > 70) {
        spawn(e.clientX, e.clientY);
        lastSpawnX = e.clientX;
        lastSpawnY = e.clientY;
        lastSpawnT = now;
        if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      }
    };

    const drawDrop = (d: Drop) => {
      // goccia a lacrima: allungata in base alla velocità
      const stretch = 1 + Math.min(d.vy / 700, 1.2);
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.beginPath();
      ctx.ellipse(0, 0, d.r, d.r * stretch, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${d.hue}, 0.9)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-d.r * 0.3, -d.r * stretch * 0.35, d.r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();
      ctx.restore();
    };

    const drawStain = (d: Drop) => {
      const t = Math.min(d.age / STAIN_LIFE, 1);
      const spread = 1 - Math.pow(1 - Math.min(t * 3, 1), 3); // si allarga subito, poi si ferma
      const radius = 2 + d.stainR * spread;
      const alpha = 0.62 * Math.pow(1 - t, 1.5); // l'assorbimento: svanisce
      if (alpha <= 0.002) return;
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      ctx.scale(1, 0.62); // macchia leggermente ovale, in prospettiva
      const g = ctx.createRadialGradient(0, 0, radius * 0.15, 0, 0, radius);
      g.addColorStop(0, `rgba(${d.hue}, ${alpha * 0.55})`);
      g.addColorStop(0.75, `rgba(${d.hue}, ${alpha * 0.8})`);
      g.addColorStop(1, `rgba(${d.hue}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        if (d.state === 'fall') {
          d.vy += GRAVITY * dt;
          d.y += d.vy * dt;
          if (d.y >= d.landY) {
            d.y = d.landY;
            d.state = 'stain';
            d.age = 0;
          } else {
            drawDrop(d);
          }
        } else {
          d.age += dt;
          if (d.age >= STAIN_LIFE) {
            drops.splice(i, 1);
            continue;
          }
          drawStain(d);
        }
      }

      raf = drops.length > 0 ? requestAnimationFrame(tick) : 0;
    };

    const onVisibility = () => {
      if (document.hidden) {
        drops.length = 0;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}
    />
  );
};
