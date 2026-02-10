/**
 * OfflineStatusBar — Shows connectivity status and sync info
 * Used across all business operation pages for offline-first UX
 * Accessible: uses aria-live for screen readers
 */
import { WifiOff, RefreshCw, CloudOff, CheckCircle } from "lucide-react";

interface OfflineStatusBarProps {
  isOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSynced: number | null;
  onRefresh?: () => void;
}

export function OfflineStatusBar({
  isOffline,
  isSyncing,
  pendingCount,
  lastSynced,
  onRefresh,
}: OfflineStatusBarProps) {
  if (!isOffline && pendingCount === 0 && !isSyncing) return null;

  const formatTime = (ts: number | null) => {
    if (!ts) return "Never";
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(ts).toLocaleTimeString();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium mb-4 ${
        isOffline
          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          : isSyncing
          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
          : "bg-green-500/10 text-green-400 border border-green-500/20"
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Offline Mode — Viewing cached data</span>
          {pendingCount > 0 && (
            <span className="ml-auto text-xs opacity-80">
              {pendingCount} change{pendingCount !== 1 ? "s" : ""} queued
            </span>
          )}
        </>
      ) : isSyncing ? (
        <>
          <RefreshCw className="w-4 h-4 shrink-0 animate-spin" aria-hidden="true" />
          <span>Syncing {pendingCount} pending change{pendingCount !== 1 ? "s" : ""}...</span>
        </>
      ) : pendingCount > 0 ? (
        <>
          <CloudOff className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{pendingCount} change{pendingCount !== 1 ? "s" : ""} pending sync</span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="ml-auto text-xs underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              aria-label="Sync pending changes now"
            >
              Sync Now
            </button>
          )}
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>All synced — Last: {formatTime(lastSynced)}</span>
        </>
      )}
    </div>
  );
}
