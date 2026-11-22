import React from 'react';

export default function Spinner({
  size = 'md', // sm | md | lg
  color = 'indigo', // indigo | white | slate
  className = '',
}) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
  };

  const colorClasses = {
    indigo: 'border-indigo-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    slate: 'border-slate-400 border-t-transparent',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} ${
        colorClasses[color] || colorClasses.indigo
      } ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
