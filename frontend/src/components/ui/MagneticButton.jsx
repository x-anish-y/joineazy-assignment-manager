import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import Spinner from './Spinner.jsx';

export default function MagneticButton({
  children,
  type = 'button',
  variant = 'primary', // primary | secondary | danger | outline | ghost
  size = 'md', // sm | md | lg
  loading = false,
  disabled = false,
  pullStrength = 0.25,
  className = '',
  onClick,
  ...props
}) {
  const buttonRef = useRef(null);
  const [ripples, setRipples] = useState([]);
  const [isTouch, setIsTouch] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const touchQuery = window.matchMedia('(pointer: coarse)');
    setIsTouch(touchQuery.matches);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
  }, []);

  const x = useSpring(0, { stiffness: 350, damping: 20 });
  const y = useSpring(0, { stiffness: 350, damping: 20 });

  const handleMouseMove = (e) => {
    if (disabled || loading || isTouch || reducedMotion || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * pullStrength;
    const distanceY = (e.clientY - centerY) * pullStrength;
    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = (e) => {
    if (disabled || loading) return;
    if (buttonRef.current && !reducedMotion) {
      const rect = buttonRef.current.getBoundingClientRect();
      const rippleX = e.clientX - rect.left;
      const rippleY = e.clientY - rect.top;
      const rippleId = Date.now();
      setRipples((prev) => [...prev, { id: rippleId, x: rippleX, y: rippleY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 600);
    }
    onClick?.(e);
  };

  const baseClasses =
    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer overflow-hidden';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-sm hover:shadow-md active:scale-[0.98]',
    secondary:
      'bg-surface text-text border border-border hover:bg-surface-hover focus:ring-primary shadow-sm active:scale-[0.98]',
    danger:
      'bg-danger text-white hover:bg-danger/90 focus:ring-danger shadow-sm active:scale-[0.98]',
    outline:
      'bg-transparent text-primary border border-primary/80 hover:bg-primary-light focus:ring-primary active:scale-[0.98]',
    ghost:
      'bg-transparent text-text-muted hover:bg-surface-hover hover:text-text focus:ring-border active:scale-[0.98]',
  };

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      disabled={disabled || loading}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ x, y }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {/* Click Ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/25 pointer-events-none animate-ping"
          style={{
            left: ripple.x - 12,
            top: ripple.y - 12,
            width: 24,
            height: 24,
            animationDuration: '0.6s',
          }}
        />
      ))}

      {loading && (
        <Spinner
          size="sm"
          color={
            variant === 'secondary' || variant === 'ghost' || variant === 'outline'
              ? 'indigo'
              : 'white'
          }
        />
      )}
      {children}
    </motion.button>
  );
}
