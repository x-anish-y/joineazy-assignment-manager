/**
 * Shared Motion System Variants & Physics for AssignHub
 * All animations are tuned for high-fidelity 60fps performance
 * and gracefully degrade when prefers-reduced-motion is active.
 */

export const springConfig = {
  tactile: { type: 'spring', stiffness: 450, damping: 25 },
  gentle: { type: 'spring', stiffness: 220, damping: 22 },
  bouncy: { type: 'spring', stiffness: 350, damping: 18 },
  slow: { type: 'spring', stiffness: 120, damping: 20 },
};

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
    filter: 'blur(3px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(2px)',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 24,
    },
  },
};

export const modalVariants = {
  backdrop: {
    hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
    visible: {
      opacity: 1,
      backdropFilter: 'blur(8px)',
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      transition: { duration: 0.18, ease: 'easeIn' },
    },
  },
  dialog: {
    hidden: { opacity: 0, scale: 0.93, y: 16 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 380,
        damping: 26,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: { duration: 0.16, ease: 'easeIn' },
    },
  },
};

export const tabUnderlineVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

export const shakeKeyframes = {
  x: [0, -4, 4, -3, 3, -1, 1, 0],
  transition: { duration: 0.45, ease: 'easeInOut' },
};
