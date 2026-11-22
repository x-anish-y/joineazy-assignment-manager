import React from 'react';

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  footer,
  noPadding = false,
  ...props
}) {
  return (
    <div
      className={`bg-surface/85 backdrop-blur-md rounded-2xl border border-border shadow-sm transition-all hover:shadow-md ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div>
            {title && <h3 className="font-semibold text-text text-base tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
      {footer && (
        <div className="bg-bg-subtle/70 border-t border-border-subtle px-6 py-3.5 rounded-b-2xl flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}
