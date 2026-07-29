import { useEffect, useRef } from 'react';

// A lightweight canvas starfield with slow drift + twinkle, plus a few soft
// "nebula" glows rendered as radial gradients. Purely decorative.

type Star = {
  x: number;
  y: number;
  z: number;
  r: number;
  baseAlpha: number;
  twPhase: number;
  twSpeed: number;
};

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let raf = 0;
    let t = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(220, Math.floor((width * height) / 7000));
      stars = Array.from({ length: count }, () => createStar(width, height));
    };

    const render = () => {
      t += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Nebula glows
      const glows = [
        { x: width * 0.2, y: height * 0.3, r: width * 0.4, color: 'rgba(56,189,248,0.10)' },
        { x: width * 0.8, y: height * 0.7, r: width * 0.45, color: 'rgba(20,184,166,0.09)' },
        { x: width * 0.55, y: height * 0.15, r: width * 0.3, color: 'rgba(125,211,252,0.07)' },
      ];
      glows.forEach((g) => {
        const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
        grad.addColorStop(0, g.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      // Stars
      for (const s of stars) {
        s.x += s.z * 0.05;
        if (s.x > width + 2) s.x = -2;
        const tw = 0.5 + 0.5 * Math.sin(t * s.twSpeed + s.twPhase);
        const alpha = s.baseAlpha * (0.4 + 0.6 * tw);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

function createStar(w: number, h: number): Star {
  const z = Math.random();
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    z: 0.2 + z * 0.8,
    r: 0.3 + z * 1.4,
    baseAlpha: 0.3 + z * 0.6,
    twPhase: Math.random() * Math.PI * 2,
    twSpeed: 0.4 + Math.random() * 1.6,
  };
}
