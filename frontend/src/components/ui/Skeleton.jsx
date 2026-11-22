import React from 'react';

export default function Skeleton({
  className = '',
  variant = 'text', // text | rectangular | circular | card
}) {
  const baseClasses = 'animate-pulse bg-slate-200/80 rounded-md';

  if (variant === 'circular') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
          <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-20 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`} />;
}
