/**
 * Format a date string into readable date and time
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative due date countdown
 */
export function formatDueCountdown(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const due = new Date(dateString);
  const diffMs = due - now;
  const isPast = diffMs < 0;
  const absDiffSec = Math.floor(Math.abs(diffMs) / 1000);

  const days = Math.floor(absDiffSec / 86400);
  const hours = Math.floor((absDiffSec % 86400) / 3600);
  const minutes = Math.floor((absDiffSec % 3600) / 60);

  if (isPast) {
    if (days > 0) return `Overdue by ${days}d ${hours}h`;
    if (hours > 0) return `Overdue by ${hours}h ${minutes}m`;
    return `Overdue by ${minutes}m`;
  } else {
    if (days > 0) return `Due in ${days}d ${hours}h`;
    if (hours > 0) return `Due in ${hours}h ${minutes}m`;
    return `Due in ${minutes}m`;
  }
}
