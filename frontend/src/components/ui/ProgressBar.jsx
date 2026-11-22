import React from 'react';

export default function ProgressBar({
  value = 0, // 0 - 100
  size = 'md', // sm | md | lg
  showLabel = false,
  colorScheme = 'indigo', // indigo | emerald | dynamic
  className = '',
}) {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getColor = () => {
    if (colorScheme === 'dynamic') {
      if (clampedValue === 100) return 'bg-emerald-500';
      if (clampedValue >= 50) return 'bg-indigo-600';
      if (clampedValue >= 25) return 'bg-amber-500';
      return 'bg-slate-400';
    }
    if (colorScheme === 'emerald') return 'bg-emerald-500';
    return 'bg-indigo-600';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
          <span>Completion Progress</span>
          <span className="font-semibold text-slate-800">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeClasses[size] || sizeClasses.md}`}>
        <div
          className={`${getColor()} ${sizeClasses[size] || sizeClasses.md} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
