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
      className={`bg-white rounded-xl border border-slate-200/90 shadow-sm transition-all hover:shadow-md ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            {title && <h3 className="font-semibold text-slate-900 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
      {footer && (
        <div className="bg-slate-50/60 border-t border-slate-100 px-6 py-3.5 rounded-b-xl flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}
