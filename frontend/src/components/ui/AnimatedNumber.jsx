import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function AnimatedNumber({
  value = 0,
  duration = 1.2,
  format = (val) => Math.round(val),
  className = '',
}) {
  const spanRef = useRef(null);
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 90, damping: 15 });

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      if (spanRef.current) {
        spanRef.current.textContent = format(value);
      }
      return;
    }
    motionVal.set(value);
  }, [value, motionVal, format]);

  useEffect(() => {
    const unsubscribe = springVal.on('change', (latest) => {
      if (spanRef.current) {
        spanRef.current.textContent = format(latest);
      }
    });
    return () => unsubscribe();
  }, [springVal, format]);

  return <span ref={spanRef} className={className}>{format(value)}</span>;
}
