import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    type = 'text',
    className = '',
    containerClassName = '',
    required = false,
    icon: Icon,
    ...props
  },
  ref
) {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-semibold text-text mb-1.5">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          required={required}
          className={`block w-full rounded-xl border bg-surface text-text text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-bg-subtle disabled:text-text-muted ${
            Icon ? 'pl-10' : 'px-3.5'
          } py-2.5 ${
            error
              ? 'border-danger text-danger placeholder:text-danger/50 focus:border-danger focus:ring-danger/20'
              : 'border-border placeholder:text-text-muted/60 focus:border-primary hover:border-text-muted/60'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-danger flex items-center gap-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
