/**
 * Format a date as relative time (e.g., "2 hours ago", "just now")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 30) {
    return "just now";
  } else if (diffSecs < 60) {
    return `${diffSecs}s ago`;
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    // Fall back to date format for older messages
    return date.toLocaleDateString();
  }
}

/**
 * Format a date with both time and relative time
 */
export function formatTimeWithRelative(date: Date): string {
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const relative = formatRelativeTime(date);
  return `${time} (${relative})`;
}
