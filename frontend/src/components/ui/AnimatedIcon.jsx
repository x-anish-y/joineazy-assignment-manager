import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedIcon({
  icon: Icon,
  type = 'default', // bell | link | trash | plus | chevron | check | chart | default
  tooltip = '',
  className = '',
  size = 20,
  isActive = false,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);

  const getAnimation = () => {
    if (!isHovered && !isActive) return {};
    switch (type) {
      case 'bell':
        return { rotate: [0, -14, 12, -8, 4, 0], transition: { duration: 0.5 } };
      case 'link':
        return { x: [0, 2.5, 0], y: [0, -2.5, 0], transition: { duration: 0.35 } };
      case 'trash':
        return { rotate: [0, -12, 10, -8, 5, 0], transition: { duration: 0.4 } };
      case 'plus':
        return { rotate: 90, transition: { type: 'spring', stiffness: 350, damping: 20 } };
      case 'chevron':
        return { x: 4, transition: { type: 'spring', stiffness: 400, damping: 22 } };
      case 'check':
        return { scale: [1, 1.25, 1], transition: { duration: 0.3 } };
      case 'chart':
        return { scaleY: [1, 1.2, 0.95, 1], transition: { duration: 0.4 } };
      default:
        return { scale: 1.15, transition: { duration: 0.2 } };
    }
  };

  return (
    <div
      className="relative inline-flex items-center justify-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={getAnimation()}
        initial={false}
        className="inline-flex items-center justify-center"
      >
        <Icon size={size} className={className} {...props} />
      </motion.div>

      {/* Tooltip for icon buttons */}
      {tooltip && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 2 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-8 px-2.5 py-1 bg-slate-900/90 text-white text-[11px] font-medium rounded-lg shadow-lg border border-slate-700/60 whitespace-nowrap z-50 backdrop-blur-md"
        >
          {tooltip}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 border-t border-l border-slate-700/60 rotate-45" />
        </motion.div>
      )}
    </div>
  );
}
