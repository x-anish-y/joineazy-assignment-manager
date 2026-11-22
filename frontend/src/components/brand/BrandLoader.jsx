import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo.jsx';

export default function BrandLoader({ text = 'Preparing your workspace...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/95 backdrop-blur-xl text-text p-6 select-none"
    >
      {/* Background Soft Aura */}
      <div className="absolute h-72 w-72 rounded-full bg-gradient-to-tr from-primary/20 via-accent/15 to-transparent blur-3xl pointer-events-none animate-pulse" />

      {/* Animated Brand Mark */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        <Logo variant="mark-only" size={68} animated={true} />

        {/* Wordmark */}
        <div className="text-center mt-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-text">
            Assign<span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">Hub</span>
          </h1>
          <p className="text-xs text-text-muted mt-1 font-medium">{text}</p>
        </div>

        {/* Animated Loading Track */}
        <div className="w-44 h-1.5 bg-bg-subtle rounded-full overflow-hidden mt-3 border border-border/40 relative">
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: 'easeInOut',
            }}
            className="w-1/2 h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full shadow-sm"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
