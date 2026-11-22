import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';
import MagneticButton from '../components/ui/MagneticButton.jsx';
import AnimatedBackground from '../components/ui/AnimatedBackground.jsx';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-bg text-text flex items-center justify-center p-4 selection:bg-primary/20">
      <AnimatedBackground intensity="subtle" />

      <div className="relative z-10 max-w-lg w-full text-center bg-surface/85 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-border shadow-2xl space-y-6">
        {/* Playful Animated SVG Illustration */}
        <div className="relative flex justify-center items-center py-2">
          {/* Ambient blur orb */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-32 w-32 rounded-full bg-primary/25 blur-2xl"
          />

          <motion.svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10"
          >
            {/* Drifting planet */}
            <motion.circle
              cx="70"
              cy="70"
              r="40"
              fill="url(#planetGrad)"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Orbit ring */}
            <motion.ellipse
              cx="70"
              cy="70"
              rx="62"
              ry="22"
              stroke="#818cf8"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              className="opacity-70"
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '70px 70px' }}
            />
            {/* Orbiting mini moon */}
            <motion.circle
              cx="128"
              cy="70"
              r="7"
              fill="#06b6d4"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '70px 70px' }}
            />
            {/* Floating flag */}
            <motion.path
              d="M70 45V75M70 45L84 52L70 59"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <defs>
              <linearGradient id="planetGrad" x1="30" y1="30" x2="110" y2="110">
                <stop stopColor="#6366f1" />
                <stop offset="0.5" stopColor="#4f46e5" />
                <stop offset="1" stopColor="#312e81" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>

        <div>
          <span className="text-6xl font-black bg-gradient-to-r from-indigo-500 via-primary to-cyan-400 bg-clip-text text-transparent tracking-tighter">
            404
          </span>
          <h1 className="text-xl font-bold text-text mt-2">Lost in the AssignHub Cosmos</h1>
          <p className="text-xs text-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
            The milestone or page you are navigating toward has vanished or moved to another coordinate.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/">
            <MagneticButton className="w-full sm:w-auto px-6 py-2.5 shadow-lg shadow-primary/25">
              <Home className="h-4 w-4 mr-2" />
              Return to Safe Orbit
            </MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
