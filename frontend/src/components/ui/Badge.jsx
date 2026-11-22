import React from 'react';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, Clock } from 'lucide-react';
import { shakeKeyframes } from '../../lib/motion.js';

export default function Badge({
  children,
  variant = 'default', // default | pending | submitted | overdue | leader | member | admin | student
  size = 'md', // sm | md
  className = '',
}) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
  };

  const variantClasses = {
    default: 'bg-bg-subtle text-text-muted border-border',
    pending: 'bg-warning-light text-amber-700 dark:text-amber-300 border-warning/30',
    submitted: 'bg-success-light text-emerald-700 dark:text-emerald-300 border-success/30',
    overdue: 'bg-danger-light text-rose-700 dark:text-rose-300 border-danger/30',
    leader: 'bg-primary-light text-primary dark:text-indigo-300 border-primary/30',
    member: 'bg-accent-light text-accent dark:text-cyan-300 border-accent/30',
    admin: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
    student: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
  };

  const normalizedVariant = variant.toLowerCase();
  const appliedClass = variantClasses[normalizedVariant] || variantClasses.default;

  // Overdue subtle warning shake once on mount
  const isOverdue = normalizedVariant === 'overdue';
  const isPending = normalizedVariant === 'pending';
  const isSubmitted = normalizedVariant === 'submitted';

  return (
    <motion.span
      animate={isOverdue ? shakeKeyframes : undefined}
      className={`inline-flex items-center justify-center font-medium rounded-full border transition-all ${
        sizeClasses[size] || sizeClasses.md
      } ${appliedClass} ${className}`}
    >
      {/* Animated icon indicator based on variant */}
      {isPending && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
      )}

      {isSubmitted && (
        <svg className="h-3 w-3 mr-0.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 12 12" fill="none">
          <motion.path
            d="M2.5 6.5L4.5 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </svg>
      )}

      {children}
    </motion.span>
  );
}
