'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { HardDrive, Satellite, Lock, CheckCircle, AlertTriangle, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface BackupRecord {
  id: string;
  title: string;
  size: number;
  date: Date;
  status: 'backed_up' | 'backing_up' | 'pending' | 'failed';
  encryption: 'AES-256' | 'RSA-2048';
  location: 'local' | 'satellite' | 'hybrid';
  progress: number;
}

export function RecordingBackupSystem() {
  const [backups, setBackups] = useState<BackupRecord[]>([
    {
      id: 'backup-1',
      title: 'Sunday Healing Session - Full Performance',
      size: 2847,
      date: new Date(Date.now() - 86400000),
      status: 'backed_up',
      encryption: 'AES-256',
      location: 'hybrid',
      progress: 100,
    },
    {
      id: 'backup-2',
      title: 'Solfeggio Frequencies - 528 Hz Session',
      size: 1523,
      date: new Date(Date.now() - 172800000),
      status: 'backed_up',
      encryption: 'AES-256',
      location: 'satellite',
      progress: 100,
    },
    {
      id: 'backup-3',
      title: 'Soul Elevation - Live Band Recording',
      size: 3201,
      date: new Date(),
      status: 'backing_up',
      encryption: 'AES-256',
      location: 'hybrid',
      progress: 65,
    },
  ]);

  const [totalStorage, setTotalStorage] = useState(10000); // MB
  const [usedStorage, setUsedStorage] = useState(7571); // MB
  const [autoBackup, setAutoBackup] = useState(true);

  // Simulate backup progress
  useEffect(() => {
    const interval = setInterval(() => {
      setBackups((prevBackups) =>
        prevBackups.map((backup) => {
          if (backup.status === 'backing_up' && backup.progress < 100) {
            const newProgress = Math.min(100, backup.progress + Math.random() * 15);
            if (newProgress >= 100) {
              toast.success(`Backup complete: ${backup.title}`);
              return { ...backup, progress: 100, status: 'backed_up' };
            }
            return { ...backup, progress: newProgress };
          }
          return backup;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'backed_up':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'backing_up':
        return <Upload className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <HardDrive className="w-5 h-5 text-slate-400" />;
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'satellite':
        return <Satellite className="w-4 h-4" />;
      case 'hybrid':
        return (
          <>
            <HardDrive className="w-4 h-4" />
            <Satellite className="w-4 h-4" />
          </>
        );
      default:
        return <HardDrive className="w-4 h-4" />;
    }
  };

  const formatSize = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(0)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card className="bg-slate-800/40 border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-400" />
            Storage Status
          </CardTitle>
          <CardDescription>Local and satellite backup capacity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Total Capacity</span>
              <span className="text-sm font-semibold text-white">
                {formatSize(usedStorage)} / {formatSize(totalStorage)}
              </span>
            </div>
            <Progress value={(usedStorage / totalStorage) * 100} className="h-3 bg-slate-700" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Used</div>
              <div className="text-lg font-bold text-white">{formatSize(usedStorage)}</div>
            </div>
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Available</div>
              <div className="text-lg font-bold text-green-400">{formatSize(totalStorage - usedStorage)}</div>
            </div>
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Usage</div>
              <div className="text-lg font-bold text-white">{Math.round((usedStorage / totalStorage) * 100)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Backup Control */}
      <Card className="bg-slate-800/40 border-slate-700/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white mb-1">Automatic Backup</h3>
              <p className="text-sm text-slate-400">
                {autoBackup ? 'Enabled - Recordings backed up automatically' : 'Disabled - Manual backup only'}
              </p>
            </div>
            <button
              onClick={() => {
                setAutoBackup(!autoBackup);
                toast.info(autoBackup ? 'Auto-backup disabled' : 'Auto-backup enabled');
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                autoBackup
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-slate-600 hover:bg-slate-700 text-white'
              }`}
            >
              {autoBackup ? 'ON' : 'OFF'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Records */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white">Recent Backups</h3>
        {backups.map((backup) => (
          <Card key={backup.id} className="bg-slate-800/40 border-slate-700/30">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(backup.status)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{backup.title}</h4>
                      <p className="text-sm text-slate-400">{formatSize(backup.size)}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      backup.status === 'backed_up'
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : backup.status === 'backing_up'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                    }
                  >
                    {backup.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {/* Progress Bar (if backing up) */}
                {backup.status === 'backing_up' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Backup Progress</span>
                      <span className="text-xs font-semibold text-white">{Math.round(backup.progress)}%</span>
                    </div>
                    <Progress value={backup.progress} className="h-2 bg-slate-700" />
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Lock className="w-4 h-4" />
                    <span>{backup.encryption}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    {getLocationIcon(backup.location)}
                    <span className="capitalize">{backup.location}</span>
                  </div>
                  <div className="text-slate-400 text-right">
                    {backup.date.toLocaleDateString()} {backup.date.toLocaleTimeString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-700/30">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Satellite className="w-4 h-4 mr-2" />
                    Sync Satellite
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Encryption Info */}
      <Card className="bg-slate-800/40 border-slate-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-purple-400" />
            Encryption Details
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-400 space-y-2">
          <p>• Local backups: AES-256-GCM encryption</p>
          <p>• Satellite backups: RSA-2048 key exchange + AES-256-GCM</p>
          <p>• All data encrypted at rest and in transit</p>
          <p>• Encryption keys stored in secure vault</p>
        </CardContent>
      </Card>
    </div>
  );
}
