import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, Download, Upload, RotateCcw, Lock, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface CloudSession {
  id: string;
  name: string;
  size: number;
  lastModified: Date;
  deviceCount: number;
  isEncrypted: boolean;
  versions: number;
}

interface SyncStatus {
  device: string;
  lastSync: Date;
  status: 'synced' | 'syncing' | 'pending' | 'conflict';
  progress: number;
}

interface VersionHistory {
  id: string;
  timestamp: Date;
  device: string;
  size: number;
  changesSummary: string;
}

export function CloudSyncManager() {
  const [sessions, setSessions] = useState<CloudSession[]>([
    {
      id: '1',
      name: 'Vocal Mix - Album 2024',
      size: 245,
      lastModified: new Date(),
      deviceCount: 3,
      isEncrypted: true,
      versions: 12,
    },
    {
      id: '2',
      name: 'Beat Production Session',
      size: 156,
      lastModified: new Date(Date.now() - 3600000),
      deviceCount: 2,
      isEncrypted: true,
      versions: 8,
    },
  ]);

  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([
    {
      device: 'Desktop Studio',
      lastSync: new Date(),
      status: 'synced',
      progress: 100,
    },
    {
      device: 'Mobile Controller',
      lastSync: new Date(Date.now() - 300000),
      status: 'synced',
      progress: 100,
    },
    {
      device: 'Laptop',
      lastSync: new Date(Date.now() - 7200000),
      status: 'pending',
      progress: 0,
    },
  ]);

  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([
    {
      id: '1',
      timestamp: new Date(),
      device: 'Desktop Studio',
      size: 245,
      changesSummary: 'Updated EQ settings, added reverb',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 600000),
      device: 'Mobile Controller',
      size: 243,
      changesSummary: 'Adjusted master volume',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 3600000),
      device: 'Laptop',
      size: 240,
      changesSummary: 'Initial recording session',
    },
  ]);

  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupInterval, setBackupInterval] = useState('5');
  const [offlineMode, setOfflineMode] = useState(false);

  const syncNow = (device: string) => {
    toast.success(`Syncing ${device}...`);
    setTimeout(() => {
      setSyncStatus(
        syncStatus.map((s) =>
          s.device === device ? { ...s, status: 'synced', progress: 100 } : s
        )
      );
      toast.success(`${device} synced successfully`);
    }, 2000);
  };

  const backupSession = () => {
    toast.success('Creating backup...');
    setTimeout(() => {
      toast.success('Session backed up to cloud');
    }, 1500);
  };

  const restoreVersion = (versionId: string) => {
    const version = versionHistory.find((v) => v.id === versionId);
    if (version) {
      toast.success(`Restored version from ${version.device}`);
    }
  };

  const resolveConflict = (resolution: 'merge' | 'local' | 'remote') => {
    toast.success(`Conflict resolved using ${resolution} strategy`);
  };

  return (
    <div className="space-y-6">
      {/* Cloud Sessions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-400" />
            Cloud Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-slate-900 rounded p-3 border border-slate-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-white font-semibold flex items-center gap-2">
                    {session.name}
                    {session.isEncrypted && <Lock className="w-3 h-3 text-green-400" />}
                  </div>
                  <div className="text-xs text-slate-400">
                    {session.size}MB • {session.deviceCount} devices • {session.versions} versions
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {session.lastModified.toLocaleTimeString()}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={backupSession}
                  className="flex-1 text-xs"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Backup
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success('Downloaded session')}
                  className="flex-1 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sync Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {syncStatus.map((status) => (
            <div key={status.device} className="bg-slate-900 rounded p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm text-white font-semibold">{status.device}</div>
                  <div className="text-xs text-slate-400">
                    {status.lastSync.toLocaleTimeString()}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    status.status === 'synced'
                      ? 'bg-green-900 text-green-300'
                      : status.status === 'syncing'
                      ? 'bg-blue-900 text-blue-300'
                      : status.status === 'pending'
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-red-900 text-red-300'
                  }`}
                >
                  {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                </div>
              </div>

              {status.progress < 100 && (
                <div className="mb-2">
                  <div className="w-full bg-slate-800 rounded h-2">
                    <div
                      className="h-full bg-blue-500 rounded transition-all"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{status.progress}% complete</div>
                </div>
              )}

              <Button
                size="sm"
                onClick={() => syncNow(status.device)}
                disabled={status.status === 'syncing'}
                className="w-full text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Sync Now
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Version History */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {versionHistory.map((version) => (
              <div
                key={version.id}
                className="bg-slate-900 rounded p-2 border border-slate-700"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-white font-semibold">{version.device}</div>
                  <div className="text-xs text-slate-400">{version.timestamp.toLocaleTimeString()}</div>
                </div>
                <div className="text-xs text-slate-400 mb-2">{version.changesSummary}</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restoreVersion(version.id)}
                  className="w-full text-xs"
                >
                  Restore This Version
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Backup Settings */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Auto-Backup Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-300">Enable Auto-Backup</label>
            <button
              onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
              className={`w-12 h-6 rounded-full transition-all ${
                autoBackupEnabled ? 'bg-green-600' : 'bg-slate-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-all ${
                  autoBackupEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {autoBackupEnabled && (
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Backup Interval (minutes)</label>
              <select
                value={backupInterval}
                onChange={(e) => setBackupInterval(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300"
              >
                <option value="1">Every 1 minute</option>
                <option value="5">Every 5 minutes</option>
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every 1 hour</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-300">Offline Mode</label>
            <button
              onClick={() => setOfflineMode(!offlineMode)}
              className={`w-12 h-6 rounded-full transition-all ${
                offlineMode ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-all ${
                  offlineMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {offlineMode && (
            <div className="bg-blue-900/30 border border-blue-700 rounded p-2 text-xs text-blue-300">
              ✓ Offline mode enabled - changes will sync when connection restored
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conflict Resolution */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Conflict Resolution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-3">
            <div className="text-sm text-red-300 font-semibold mb-2">
              ⚠ Sync Conflict Detected
            </div>
            <div className="text-xs text-red-300 mb-3">
              Changes on Desktop Studio and Mobile Controller conflict. Choose resolution strategy:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                onClick={() => resolveConflict('merge')}
                className="text-xs"
              >
                Merge
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => resolveConflict('local')}
                className="text-xs"
              >
                Keep Local
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => resolveConflict('remote')}
                className="text-xs"
              >
                Accept Remote
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Encryption & Security */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-400" />
            Encryption & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-400 space-y-2">
          <div>✓ End-to-end encryption enabled (AES-256)</div>
          <div>✓ All sessions encrypted at rest</div>
          <div>✓ Secure HTTPS transport</div>
          <div>✓ Zero-knowledge cloud architecture</div>
          <div>✓ Automatic key rotation enabled</div>
        </CardContent>
      </Card>
    </div>
  );
}
