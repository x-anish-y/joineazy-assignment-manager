import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button.jsx';

export default function EmptyState({
  title = 'No items found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border bg-surface/50 text-text ${className}`}
    >
      {/* Animated Looping SVG Illustration */}
      <div className="relative mb-4 flex items-center justify-center">
        {/* Soft glowing ambient circle */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute h-20 w-20 rounded-full bg-primary/20 blur-xl"
        />

        <motion.svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Base pedestal floating gently */}
          <motion.ellipse
            cx="40"
            cy="66"
            rx="24"
            ry="6"
            fill="currentColor"
            className="text-border"
            animate={{ scaleX: [1, 0.85, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Floating box/container */}
          <motion.g
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Folder / card layer back */}
            <rect
              x="22"
              y="26"
              width="36"
              height="28"
              rx="6"
              fill="currentColor"
              className="text-primary-light"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Front flap */}
            <path
              d="M22 36L40 44L58 36"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Floating sparkle/star */}
            <motion.circle
              cx="58"
              cy="20"
              r="3"
              fill="#06b6d4"
              animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="20"
              cy="24"
              r="2"
              fill="#818cf8"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
            />
          </motion.g>
        </motion.svg>
      </div>

      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <p className="text-xs text-text-muted max-w-sm mt-1 mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
