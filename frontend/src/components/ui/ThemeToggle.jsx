import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Monitor } from 'lucide-react';

export default function ThemeToggle({ className = '', showLabel = false, size = 'md' }) {
  const { mode, theme, isDark, toggleTheme, setMode } = useTheme();

  const buttonSizes = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  const handleToggle = (e) => {
    toggleTheme(e);
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <motion.button
        type="button"
        onClick={handleToggle}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`relative inline-flex items-center justify-center rounded-xl border border-border bg-surface/80 hover:bg-surface-hover text-text-muted hover:text-text shadow-sm backdrop-blur-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${buttonSizes[size] || buttonSizes.md}`}
        aria-label={`Switch theme (currently ${mode})`}
        title={`Current: ${mode.toUpperCase()} (Click to toggle)`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              {/* Animated Moon SVG with glowing crater and star */}
              <svg
                width={iconSizes[size] || 18}
                height={iconSizes[size] || 18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fillOpacity="0.2" />
                <motion.circle
                  cx="19"
                  cy="5"
                  r="1"
                  fill="#818cf8"
                  animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex items-center justify-center"
            >
              {/* Animated Sun SVG with dynamic rays */}
              <svg
                width={iconSizes[size] || 18}
                height={iconSizes[size] || 18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              >
                <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {showLabel && (
        <span className="text-xs font-medium text-text-muted capitalize">
          {mode === 'system' ? `Auto (${theme})` : mode}
        </span>
      )}
    </div>
  );
}
