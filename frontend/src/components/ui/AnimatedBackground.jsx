import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function AnimatedBackground({ intensity = 'subtle' }) {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);

  const isHero = intensity === 'hero';

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e) => setReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  useEffect(() => {
    // If reduced motion is requested, canvas loop is bypassed
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Detect low-power/budget hardware
    const isLowPower =
      typeof navigator !== 'undefined' &&
      navigator.hardwareConcurrency !== undefined &&
      navigator.hardwareConcurrency <= 4;

    // Particles & Ripples
    let particles = [];
    let ripples = [];

    // Mouse tracking with RAF throttling
    let mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999, isHovered: false };
    let lastTime = performance.now();

    // Floating Aurora Orbs
    const orbs = [
      {
        baseX: 0.2,
        baseY: 0.25,
        radius: isHero ? 320 : 260,
        speedX: 0.0004,
        speedY: 0.0003,
        phase: 0,
        colorDark: 'rgba(99, 102, 241, ',
        colorLight: 'rgba(199, 210, 254, ',
        alpha: isHero ? (isDark ? 0.22 : 0.65) : (isDark ? 0.09 : 0.4),
      },
      {
        baseX: 0.8,
        baseY: 0.7,
        radius: isHero ? 360 : 300,
        speedX: -0.00035,
        speedY: 0.00045,
        phase: Math.PI / 2,
        colorDark: 'rgba(34, 211, 238, ',
        colorLight: 'rgba(224, 242, 254, ',
        alpha: isHero ? (isDark ? 0.18 : 0.6) : (isDark ? 0.07 : 0.35),
      },
      {
        baseX: 0.5,
        baseY: 0.85,
        radius: isHero ? 300 : 240,
        speedX: 0.0005,
        speedY: -0.0003,
        phase: Math.PI,
        colorDark: 'rgba(168, 85, 247, ',
        colorLight: 'rgba(243, 232, 255, ',
        alpha: isHero ? (isDark ? 0.16 : 0.55) : (isDark ? 0.06 : 0.3),
      },
    ];

    // Resize handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Re-initialize particles based on viewport area
      initParticles();
    };

    const initParticles = () => {
      // Density: calculate particle count based on area
      const area = width * height;
      const divisor = isHero ? (isLowPower ? 24000 : 15000) : (isLowPower ? 40000 : 25000);
      const rawCount = Math.floor(area / divisor);
      const count = Math.max(12, Math.min(rawCount, isHero ? 75 : 42));

      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (isHero ? 0.55 : 0.35),
          vy: (Math.random() - 0.5) * (isHero ? 0.55 : 0.35),
          radius: Math.random() * 1.5 + 1.2,
          alpha: Math.random() * 0.4 + 0.3,
        });
      }
    };

    // Mouse handlers
    const handlePointerMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovered = true;
    };

    const handlePointerLeave = () => {
      mouse.isHovered = false;
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    };

    // Soft click ripple burst
    const handlePointerDown = (e) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: Math.min(width, height) * (isHero ? 0.35 : 0.25),
        speed: 4.8,
        alpha: isDark ? 0.55 : 0.35,
      });

      // Limit concurrent ripples for performance
      if (ripples.length > 5) ripples.shift();
    };

    // Visibility change handler (pauses loop when tab is hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        lastTime = performance.now();
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };

    // Main animation loop
    const render = (currentTime) => {
      const dt = Math.min(currentTime - lastTime, 40) / 1000;
      lastTime = currentTime;

      // Smooth mouse interpolation
      if (mouse.isHovered) {
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;
      } else {
        mouse.x = -9999;
        mouse.y = -9999;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Layered Drifting Aurora Orbs
      ctx.save();
      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i];
        const timeVal = currentTime;
        const currentX = (orb.baseX + Math.sin(timeVal * orb.speedX + orb.phase) * 0.12) * width;
        const currentY = (orb.baseY + Math.cos(timeVal * orb.speedY + orb.phase) * 0.12) * height;

        const grad = ctx.createRadialGradient(
          currentX,
          currentY,
          0,
          currentX,
          currentY,
          orb.radius
        );

        const colorPrefix = isDark ? orb.colorDark : orb.colorLight;
        grad.addColorStop(0, `${colorPrefix}${orb.alpha})`);
        grad.addColorStop(0.6, `${colorPrefix}${orb.alpha * 0.4})`);
        grad.addColorStop(1, `${colorPrefix}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(currentX, currentY, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Process and Draw Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha *= 0.96;

        if (r.radius >= r.maxRadius || r.alpha <= 0.02) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
          ? `rgba(99, 102, 241, ${r.alpha})`
          : `rgba(14, 165, 233, ${r.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Push particles intersecting ripple wave
        for (let j = 0; j < particles.length; j++) {
          const p = particles[j];
          const dx = p.x - r.x;
          const dy = p.y - r.y;
          const dist = Math.hypot(dx, dy);
          if (Math.abs(dist - r.radius) < 25 && dist > 1) {
            const push = ((25 - Math.abs(dist - r.radius)) / 25) * 1.5;
            p.x += (dx / dist) * push;
            p.y += (dy / dist) * push;
          }
        }
      }

      // 3. Update & Draw Particles & Constellation Connections
      const maxConnectDist = isLowPower ? 90 : 115;
      const mouseRadius = 140;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce from edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse gently attracts/repels
        if (mouse.isHovered) {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < mouseRadius && mdist > 1) {
            // Gentle nudge away from mouse
            const force = (1 - mdist / mouseRadius) * 0.75;
            p.x -= (mdx / mdist) * force;
            p.y -= (mdy / mdist) * force;
          }
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(129, 140, 248, ${p.alpha * (isHero ? 0.75 : 0.45)})`
          : `rgba(99, 102, 241, ${p.alpha * (isHero ? 0.6 : 0.3)})`;
        ctx.fill();

        // Draw connecting constellation lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * (isDark ? 0.22 : 0.12) * (isHero ? 1 : 0.6);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isDark
              ? `rgba(99, 102, 241, ${lineAlpha})`
              : `rgba(100, 116, 139, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Setup listeners
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(render);

    // Cleanup on unmount
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDark, isHero, reducedMotion]);

  // Reduced motion static fallback
  if (reducedMotion) {
    return (
      <div
        className={`fixed inset-0 -z-10 pointer-events-none transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-tr from-slate-950 via-indigo-950/20 to-slate-950'
            : 'bg-gradient-to-tr from-slate-50 via-indigo-50/40 to-slate-50'
        }`}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none block"
      aria-hidden="true"
    />
  );
}
