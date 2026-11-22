import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function Logo({
  variant = 'full', // 'full' | 'mark-only' | 'small'
  size = 40,
  className = '',
  animated = true,
  onClick,
}) {
  const isSmall = variant === 'small';
  const effectiveSize = isSmall ? 32 : size;

  // Tilt on mouse hover
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['9deg', '-9deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-9deg', '9deg']);

  const handleMouseMove = (e) => {
    if (!ref.current || !animated) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Node drawing animation variants
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const checkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { delay: 0.6, duration: 0.65, ease: 'easeOut' },
    },
  };

  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: 0.2 + i * 0.15, duration: 0.45, type: 'spring', stiffness: 300 },
    }),
  };

  const Mark = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover="hover"
      onClick={onClick}
      className="relative flex items-center justify-center shrink-0 cursor-pointer select-none"
    >
      <svg
        width={effectiveSize}
        height={effectiveSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-[0_4px_12px_rgba(79,70,229,0.25)]"
      >
        <defs>
          {/* Base Brand Gradient */}
          <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#3730a3" />
          </linearGradient>

          {/* Arcs / Links Gradient */}
          <linearGradient id="logoLinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* Node Glow Gradient */}
          <linearGradient id="logoNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        {/* Squircle Glass Background */}
        <rect
          width="64"
          height="64"
          rx="18"
          fill="url(#logoBgGrad)"
        />
        <rect
          x="1"
          y="1"
          width="62"
          height="62"
          rx="17"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.22"
          strokeWidth="1.5"
        />

        {/* Connected Arcs (Network of Collaboration) */}
        <motion.path
          d="M20 23 C26 15, 38 15, 44 23"
          stroke="url(#logoLinkGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity="0.8"
          variants={animated ? pathVariants : undefined}
          initial={animated ? 'hidden' : 'visible'}
          animate="visible"
        />
        <motion.path
          d="M44 23 C48 33, 40 45, 32 47"
          stroke="url(#logoLinkGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity="0.8"
          variants={animated ? pathVariants : undefined}
          initial={animated ? 'hidden' : 'visible'}
          animate="visible"
        />
        <motion.path
          d="M32 47 C24 45, 16 33, 20 23"
          stroke="url(#logoLinkGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity="0.8"
          variants={animated ? pathVariants : undefined}
          initial={animated ? 'hidden' : 'visible'}
          animate="visible"
        />

        {/* Floating Node 1: Left */}
        <motion.g
          custom={0}
          variants={animated ? nodeVariants : undefined}
          initial={animated ? 'hidden' : 'visible'}
          animate="visible"
        >
          <motion.circle
            cx="20"
            cy="23"
            r="4.5"
            fill="#ffffff"
            stroke="#38bdf8"
            strokeWidth="2"
            animate={
              animated
                ? {
                    y: [-1.2, 1.2, -1.2],
                  }
                : undefined
            }
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.g>

        {/* Floating Node 2: Right */}
        <motion.g
          custom={1}
          variants={animated ? nodeVariants : undefined}
          initial={animated ? 'hidden' : 'visible'}
          animate="visible"
        >
          <motion.circle
            cx="44"
            cy="23"
            r="4.5"
            fill="#ffffff"
            stroke="#818cf8"
            strokeWidth="2"
            animate={
              animated
                ? {
                    y: [1.2, -1.2, 1.2],
                  }
                : undefined
            }
            transition={{
              duration: 3.1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.g>

        {/* Floating Node 3: Bottom Center */}
        <motion.g
          custom={2}
          variants={animated ? nodeVariants : undefined}
          initial={animated ? 'hidden' : 'visible'}
          animate="visible"
        >
          <motion.circle
            cx="32"
            cy="47"
            r="4.5"
            fill="#ffffff"
            stroke="#38bdf8"
            strokeWidth="2"
            animate={
              animated
                ? {
                    y: [-1, 1, -1],
                  }
                : undefined
            }
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.g>

        {/* Central Completion Checkmark */}
        <motion.path
          d="M24 32.5 L29.5 38 L40.5 26.5"
          stroke="#ffffff"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={animated ? checkVariants : undefined}
          initial={animated ? 'hidden' : 'visible'}
          animate="visible"
          whileHover={{
            scale: 1.12,
            transition: { duration: 0.2 },
          }}
          className="origin-center"
        />
      </svg>
    </motion.div>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center ${className}`}>{Mark}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {Mark}
      <div className="flex flex-col select-none">
        <span
          className={`font-bold tracking-tight text-text leading-tight ${
            isSmall ? 'text-base' : 'text-lg sm:text-xl'
          }`}
        >
          Assign
          <span className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Hub
          </span>
        </span>
        {!isSmall && (
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Assignment Manager
          </span>
        )}
      </div>
    </div>
  );
}
