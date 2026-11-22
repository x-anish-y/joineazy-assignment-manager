import React from 'react';

export default function Skeleton({
  className = '',
  variant = 'text', // text | rectangular | circular | card
}) {
  const baseClasses = 'relative overflow-hidden bg-text-muted/10 rounded-lg';
  const shimmerClasses =
    'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.8s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/10 dark:after:via-white/5 after:to-transparent';

  if (variant === 'circular') {
    return <div className={`${baseClasses} ${shimmerClasses} rounded-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`bg-surface/80 rounded-2xl border border-border p-6 space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className={`h-4 w-28 ${baseClasses} ${shimmerClasses}`} />
          <div className={`h-6 w-16 ${baseClasses} ${shimmerClasses} rounded-full`} />
        </div>
        <div className="space-y-2">
          <div className={`h-5 w-3/4 ${baseClasses} ${shimmerClasses}`} />
          <div className={`h-3 w-full ${baseClasses} ${shimmerClasses}`} />
          <div className={`h-3 w-2/3 ${baseClasses} ${shimmerClasses}`} />
        </div>
        <div className="pt-3 border-t border-border-subtle flex justify-between items-center">
          <div className={`h-3 w-24 ${baseClasses} ${shimmerClasses}`} />
          <div className={`h-8 w-20 ${baseClasses} ${shimmerClasses} rounded-lg`} />
        </div>
      </div>
    );
  }

  return <div className={`${baseClasses} ${shimmerClasses} ${className}`} />;
}
