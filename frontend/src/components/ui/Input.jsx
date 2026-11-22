import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { shakeKeyframes } from '../../lib/motion.js';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-semibold text-text mb-1.5 select-none">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted transition-colors">
            <Icon className={`h-4 w-4 ${isFocused ? 'text-primary' : ''}`} />
          </div>
        )}

        <input
          ref={ref}
          type={effectiveType}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`block w-full rounded-xl border bg-surface/90 text-text text-sm transition-all focus:outline-none focus:ring-2 disabled:bg-bg-subtle disabled:text-text-muted ${
            Icon ? 'pl-10' : 'px-3.5'
          } ${isPassword ? 'pr-10' : 'pr-3.5'} py-2.5 ${
            error
              ? 'border-danger text-danger placeholder:text-danger/50 focus:border-danger focus:ring-danger/25'
              : 'border-border placeholder:text-text-muted/60 focus:border-primary focus:ring-primary/20 hover:border-text-muted/60'
          } ${className}`}
          {...props}
        />

        {/* Password Show/Hide Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text cursor-pointer transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, ...shakeKeyframes }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1 text-xs text-danger flex items-center gap-1 font-medium"
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!error && helperText && (
        <p className="mt-1 text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
