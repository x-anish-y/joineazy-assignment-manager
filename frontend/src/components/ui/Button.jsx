import React from 'react';
import Spinner from './Spinner.jsx';

export default function Button({
  children,
  type = 'button',
  variant = 'primary', // primary | secondary | danger | outline | ghost
  size = 'md', // sm | md | lg
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-sm hover:shadow active:opacity-90',
    secondary: 'bg-surface text-text border border-border hover:bg-surface-hover focus:ring-primary shadow-sm active:bg-bg-subtle',
    danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger shadow-sm active:opacity-90',
    outline: 'bg-transparent text-primary border border-primary/80 hover:bg-primary-light focus:ring-primary',
    ghost: 'bg-transparent text-text-muted hover:bg-surface-hover hover:text-text focus:ring-border',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" color={variant === 'secondary' || variant === 'ghost' || variant === 'outline' ? 'indigo' : 'white'} />}
      {children}
    </button>
  );
}
