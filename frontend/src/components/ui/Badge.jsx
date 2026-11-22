import React from 'react';

export default function Badge({
  children,
  variant = 'default', // default | pending | submitted | overdue | leader | member | admin | student
  size = 'md', // sm | md
  className = '',
}) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs font-semibold',
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

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full border ${sizeClasses[size] || sizeClasses.md} ${appliedClass} ${className}`}
    >
      {children}
    </span>
  );
}
