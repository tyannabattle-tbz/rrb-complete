/**
 * Analytics Export Scheduler
 * Build scheduled export UI with email delivery
 * Supports daily/weekly CSV/PDF/JSON exports
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ScheduledExport {
  id: string;
  name: string;
  type: 'listener_demographics' | 'channel_performance' | 'revenue_report' | 'content_analytics' | 'creator_stats' | 'system_health';
  format: 'csv' | 'pdf' | 'json' | 'html';
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRun: number;
  lastRun?: number;
  lastStatus: 'success' | 'failed' | 'pending';
  recipientEmails: string[];
  enabled: boolean;
}

interface ExportHistory {
  id: string;
  exportId: string;
  type: string;
  format: string;
  status: 'success' | 'failed' | 'pending';
  generatedAt: number;
  fileSize?: number;
  downloadUrl?: string;
  errorMessage?: string;
}

const AnalyticsExportScheduler: React.FC = () => {
  const [exports, setExports] = useState<ScheduledExport[]>([]);
  const [history, setHistory] = useState<ExportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedExport, setSelectedExport] = useState<ScheduledExport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'listener_demographics',
    format: 'csv',
    frequency: 'daily',
    recipientEmails: '',
  });

  useEffect(() => {
    loadScheduledExports();
  }, []);

  const loadScheduledExports = async () => {
    try {
      setLoading(true);

      // Simulate loading scheduled exports
      const mockExports: ScheduledExport[] = [
        {
          id: 'export_001',
          name: 'Daily Listener Demographics',
          type: 'listener_demographics',
          format: 'csv',
          frequency: 'daily',
          nextRun: Date.now() + 3600000,
          lastRun: Date.now() - 86400000,
          lastStatus: 'success',
          recipientEmails: ['admin@example.com', 'analytics@example.com'],
          enabled: true,
        },
        {
          id: 'export_002',
          name: 'Weekly Channel Performance',
          type: 'channel_performance',
          format: 'pdf',
          frequency: 'weekly',
          nextRun: Date.now() + 604800000,
          lastRun: Date.now() - 604800000,
          lastStatus: 'success',
          recipientEmails: ['manager@example.com'],
          enabled: true,
        },
        {
          id: 'export_003',
          name: 'Monthly Revenue Report',
          type: 'revenue_report',
          format: 'json',
          frequency: 'monthly',
          nextRun: Date.now() + 2592000000,
          lastRun: Date.now() - 2592000000,
          lastStatus: 'success',
          recipientEmails: ['finance@example.com', 'cfo@example.com'],
          enabled: true,
        },
        {
          id: 'export_004',
          name: 'Content Analytics',
          type: 'content_analytics',
          format: 'html',
          frequency: 'weekly',
          nextRun: Date.now() + 172800000,
          lastRun: Date.now() - 604800000,
          lastStatus: 'failed',
          recipientEmails: ['content@example.com'],
          enabled: false,
        },
      ];

      const mockHistory: ExportHistory[] = [
        {
          id: 'hist_001',
          exportId: 'export_001',
          type: 'listener_demographics',
          format: 'csv',
          status: 'success',
          generatedAt: Date.now() - 3600000,
          fileSize: 2048000,
          downloadUrl: '/exports/listener-demographics-2026-03-23.csv',
        },
        {
          id: 'hist_002',
          exportId: 'export_002',
          type: 'channel_performance',
          format: 'pdf',
          status: 'success',
          generatedAt: Date.now() - 86400000,
          fileSize: 5120000,
          downloadUrl: '/exports/channel-performance-2026-03-22.pdf',
        },
        {
          id: 'hist_003',
          exportId: 'export_004',
          type: 'content_analytics',
          format: 'html',
          status: 'failed',
          generatedAt: Date.now() - 172800000,
          errorMessage: 'Database connection timeout',
        },
      ];

      setExports(mockExports);
      setHistory(mockHistory);
    } catch (error) {
      console.error('Failed to load scheduled exports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExport = async () => {
    try {
      const emails = formData.recipientEmails
        .split(',')
        .map(e => e.trim())
        .filter(e => e);

      const newExport: ScheduledExport = {
        id: `export_${Date.now()}`,
        name: formData.name,
        type: formData.type as any,
        format: formData.format as any,
        frequency: formData.frequency as any,
        nextRun: Date.now() + 3600000,
        lastStatus: 'pending',
        recipientEmails: emails,
        enabled: true,
      };

      setExports([...exports, newExport]);
      setShowForm(false);
      setFormData({
        name: '',
        type: 'listener_demographics',
        format: 'csv',
        frequency: 'daily',
        recipientEmails: '',
      });

      console.log('[Analytics Export] Created new scheduled export:', newExport.id);
    } catch (error) {
      console.error('Failed to create export:', error);
    }
  };

  const handleToggleExport = (exportId: string) => {
    setExports(
      exports.map(e =>
        e.id === exportId ? { ...e, enabled: !e.enabled } : e
      )
    );
  };

  const handleDeleteExport = (exportId: string) => {
    setExports(exports.filter(e => e.id !== exportId));
  };

  const handleRunNow = async (exportId: string) => {
    try {
      const newHistoryEntry: ExportHistory = {
        id: `hist_${Date.now()}`,
        exportId,
        type: 'listener_demographics',
        format: 'csv',
        status: 'pending',
        generatedAt: Date.now(),
      };

      setHistory([newHistoryEntry, ...history]);

      // Simulate export generation
      setTimeout(() => {
        setHistory(prev =>
          prev.map(h =>
            h.id === newHistoryEntry.id
              ? {
                  ...h,
                  status: 'success',
                  fileSize: Math.floor(Math.random() * 10000000),
                  downloadUrl: `/exports/export-${Date.now()}.csv`,
                }
              : h
          )
        );
      }, 2000);

      console.log('[Analytics Export] Running export now:', exportId);
    } catch (error) {
      console.error('Failed to run export:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return 'Every week';
      case 'monthly':
        return 'Every month';
      default:
        return freq;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const nextRunDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Export Scheduler</h1>
          <p className="text-slate-400">Configure automated daily/weekly/monthly exports with email delivery</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Active Exports</p>
                <p className="text-3xl font-bold text-white">{exports.filter(e => e.enabled).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Total Exports</p>
                <p className="text-3xl font-bold text-white">{exports.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">History Records</p>
                <p className="text-3xl font-bold text-white">{history.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Success Rate</p>
                <p className="text-3xl font-bold text-green-400">
                  {history.length > 0
                    ? ((history.filter(h => h.status === 'success').length / history.length) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scheduled Exports */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Scheduled Exports</h2>
              <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
                + New Export
              </Button>
            </div>

            {showForm && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Create New Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Export Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                      placeholder="e.g., Daily Listener Report"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                      <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                      >
                        <option value="listener_demographics">Listener Demographics</option>
                        <option value="channel_performance">Channel Performance</option>
                        <option value="revenue_report">Revenue Report</option>
                        <option value="content_analytics">Content Analytics</option>
                        <option value="creator_stats">Creator Stats</option>
                        <option value="system_health">System Health</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Format</label>
                      <select
                        value={formData.format}
                        onChange={e => setFormData({ ...formData, format: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                      >
                        <option value="csv">CSV</option>
                        <option value="pdf">PDF</option>
                        <option value="json">JSON</option>
                        <option value="html">HTML</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Frequency</label>
                      <select
                        value={formData.frequency}
                        onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Recipient Emails</label>
                    <textarea
                      value={formData.recipientEmails}
                      onChange={e => setFormData({ ...formData, recipientEmails: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                      placeholder="email1@example.com, email2@example.com"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateExport} className="flex-1 bg-green-600 hover:bg-green-700">
                      Create Export
                    </Button>
                    <Button
                      onClick={() => setShowForm(false)}
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400">Loading exports...</p>
                </CardContent>
              </Card>
            ) : exports.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400">No scheduled exports yet</p>
                </CardContent>
              </Card>
            ) : (
              exports.map(exp => (
                <Card key={exp.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-white">{exp.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {exp.type.replace(/_/g, ' ')} • {exp.format.toUpperCase()}
                        </p>
                      </div>
                      <Badge className={exp.enabled ? 'bg-green-600' : 'bg-slate-600'}>
                        {exp.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-slate-500">Frequency</p>
                        <p className="text-white font-semibold">{getFrequencyLabel(exp.frequency)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Next Run</p>
                        <p className="text-white font-semibold text-xs">{nextRunDate(exp.nextRun)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Recipients</p>
                        <p className="text-white font-semibold">{exp.recipientEmails.length} email(s)</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Last Status</p>
                        <p className="text-white font-semibold capitalize">{exp.lastStatus}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRunNow(exp.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Run Now
                      </Button>
                      <Button
                        onClick={() => handleToggleExport(exp.id)}
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 text-sm"
                      >
                        {exp.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        onClick={() => handleDeleteExport(exp.id)}
                        variant="outline"
                        className="flex-1 border-red-600 text-red-400 text-sm hover:bg-red-950"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Export History */}
          <div>
            <Card className="bg-slate-800 border-slate-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white">Export History</CardTitle>
                <CardDescription>Recent export runs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-slate-400 text-sm">No export history yet</p>
                  ) : (
                    history.map(entry => (
                      <div key={entry.id} className="p-3 bg-slate-700 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white capitalize">{entry.type.replace(/_/g, ' ')}</span>
                          {getStatusIcon(entry.status)}
                        </div>
                        <p className="text-xs text-slate-400">{new Date(entry.generatedAt).toLocaleString()}</p>
                        {entry.fileSize && (
                          <p className="text-xs text-slate-300 mt-1">Size: {formatFileSize(entry.fileSize)}</p>
                        )}
                        {entry.errorMessage && (
                          <p className="text-xs text-red-400 mt-1">Error: {entry.errorMessage}</p>
                        )}
                        {entry.downloadUrl && (
                          <a href={entry.downloadUrl} className="text-xs text-blue-400 hover:underline mt-2 block">
                            Download
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsExportScheduler;
