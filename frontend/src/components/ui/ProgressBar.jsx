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
    lg: 'h-3.5',
  };

  const getColor = () => {
    if (colorScheme === 'dynamic') {
      if (clampedValue === 100) return 'bg-success';
      if (clampedValue >= 50) return 'bg-primary';
      if (clampedValue >= 25) return 'bg-warning';
      return 'bg-text-muted';
    }
    if (colorScheme === 'emerald') return 'bg-success';
    return 'bg-primary';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-text-muted mb-1.5">
          <span>Completion Progress</span>
          <span className="font-semibold text-text">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-bg-subtle border border-border/40 rounded-full overflow-hidden ${sizeClasses[size] || sizeClasses.md}`}>
        <div
          className={`${getColor()} ${sizeClasses[size] || sizeClasses.md} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
