import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button.jsx';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border bg-surface/50 text-text ${className}`}>
      <div className="h-12 w-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary mb-3 shadow-inner">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <p className="text-xs text-text-muted max-w-sm mt-1 mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
