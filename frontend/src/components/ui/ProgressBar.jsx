import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({
  value = 0, // 0 - 100
  size = 'md', // sm | md | lg
  showLabel = false,
  colorScheme = 'indigo', // indigo | emerald | dynamic
  className = '',
}) {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const getGradient = () => {
    if (colorScheme === 'emerald' || (colorScheme === 'dynamic' && clampedValue === 100)) {
      return 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400';
    }
    if (colorScheme === 'dynamic' && clampedValue >= 25 && clampedValue < 50) {
      return 'bg-gradient-to-r from-amber-500 to-orange-400';
    }
    return 'bg-gradient-to-r from-indigo-500 via-primary to-cyan-400';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-text-muted mb-1.5">
          <span>Completion Progress</span>
          <span className="font-semibold text-text">{clampedValue}%</span>
        </div>
      )}
      <div
        className={`w-full bg-bg-subtle border border-border/40 rounded-full overflow-hidden p-0.5 ${
          sizeClasses[size] || sizeClasses.md
        }`}
      >
        <div className="relative h-full w-full rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clampedValue}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className={`relative h-full rounded-full ${getGradient()}`}
          >
            {/* Glowing end cap */}
            {clampedValue > 2 && (
              <span className="absolute right-0 top-0 bottom-0 w-2 rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
