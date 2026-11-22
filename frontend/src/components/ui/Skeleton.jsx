import React from 'react';

export default function Skeleton({
  className = '',
  variant = 'text', // text | rectangular | circular | card
}) {
  const baseClasses = 'animate-pulse bg-text-muted/15 rounded-lg';

  if (variant === 'circular') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`bg-surface/80 rounded-2xl border border-border p-6 space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-text-muted/15 rounded animate-pulse" />
          <div className="h-6 w-16 bg-text-muted/15 rounded-full animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-text-muted/15 rounded animate-pulse" />
          <div className="h-3 w-full bg-text-muted/15 rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-text-muted/15 rounded animate-pulse" />
        </div>
        <div className="pt-3 border-t border-border-subtle flex justify-between items-center">
          <div className="h-3 w-24 bg-text-muted/15 rounded animate-pulse" />
          <div className="h-8 w-20 bg-text-muted/15 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`} />;
}
