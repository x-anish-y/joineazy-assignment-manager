import React from 'react';

export default function Badge({
  children,
  variant = 'default', // default | pending | submitted | overdue | leader | member | admin | student
  size = 'md', // sm | md
  className = '',
}) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
    submitted: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    overdue: 'bg-rose-50 text-rose-700 border-rose-200/80',
    leader: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    member: 'bg-sky-50 text-sky-700 border-sky-200/80',
    admin: 'bg-purple-50 text-purple-700 border-purple-200/80',
    student: 'bg-blue-50 text-blue-700 border-blue-200/80',
  };

  // Map lowercase status strings if passed directly as variant
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
