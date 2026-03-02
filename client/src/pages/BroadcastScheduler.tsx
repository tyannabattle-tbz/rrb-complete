import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Send, Repeat2, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduledBroadcast {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  scheduledTime: number;
  timezone: string;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    endDate?: number;
  };
  channels: string[];
  createdBy: string;
  createdAt: number;
  status: 'scheduled' | 'sent' | 'cancelled';
}

export default function BroadcastScheduler() {
  const [schedules, setSchedules] = useState<ScheduledBroadcast[]>([
    {
      id: '1',
      title: 'Daily System Check',
      message: 'Performing routine system maintenance. Expected downtime: 5 minutes.',
      severity: 'low',
      scheduledTime: Date.now() + 24 * 60 * 60 * 1000,
      timezone: 'UTC',
      recurring: { pattern: 'daily' },
      channels: ['Email', 'In-App'],
      createdBy: 'admin@example.com',
      createdAt: Date.now(),
      status: 'scheduled',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'high' as const,
    scheduledDate: '',
    scheduledTime: '',
    timezone: 'UTC',
    recurring: 'none' as const,
    recurringEnd: '',
    channels: ['Push', 'Email'] as string[],
  });

  const timezones = [
    'UTC',
    'EST',
    'CST',
    'MST',
    'PST',
    'GMT',
    'CET',
    'IST',
    'JST',
    'AEST',
  ];

  const severityColors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/50',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    low: 'bg-green-500/20 text-green-400 border-green-500/50',
  };

  const statusColors: Record<string, string> = {
    scheduled: 'text-blue-400',
    sent: 'text-green-400',
    cancelled: 'text-red-400',
  };

  const handleAddSchedule = () => {
    if (!formData.title || !formData.message || !formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).getTime();
    if (scheduledDateTime <= Date.now()) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    const newSchedule: ScheduledBroadcast = {
      id: `schedule-${Date.now()}`,
      title: formData.title,
      message: formData.message,
      severity: formData.severity,
      scheduledTime: scheduledDateTime,
      timezone: formData.timezone,
      recurring: formData.recurring !== 'none' ? { pattern: formData.recurring as any } : undefined,
      channels: formData.channels,
      createdBy: 'current-user@example.com',
      createdAt: Date.now(),
      status: 'scheduled',
    };

    setSchedules([...schedules, newSchedule]);
    setFormData({
      title: '',
      message: '',
      severity: 'high',
      scheduledDate: '',
      scheduledTime: '',
      timezone: 'UTC',
      recurring: 'none',
      recurringEnd: '',
      channels: ['Push', 'Email'],
    });
    setShowForm(false);
    toast.success('Broadcast scheduled successfully');
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
    toast.success('Schedule deleted');
  };

  const handleCancelSchedule = (id: string) => {
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, status: 'cancelled' as const } : s))
    );
    toast.success('Schedule cancelled');
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeUntil = (timestamp: number) => {
    const diff = timestamp - Date.now();
    if (diff < 0) return 'Expired';

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Broadcast Scheduler</h1>
            <p className="text-slate-400">Schedule emergency broadcasts with recurring options</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Broadcast
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6 bg-slate-900 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Schedule New Broadcast</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Broadcast title..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Broadcast message..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Recurring</label>
              <select
                value={formData.recurring}
                onChange={(e) => setFormData({ ...formData, recurring: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Channels</label>
              <div className="flex flex-wrap gap-2">
                {['Push', 'Email', 'SMS', 'In-App', 'Siren', 'Radio'].map((channel) => (
                  <button
                    key={channel}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        channels: formData.channels.includes(channel)
                          ? formData.channels.filter((c) => c !== channel)
                          : [...formData.channels, channel],
                      });
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.channels.includes(channel)
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAddSchedule} className="bg-cyan-600 hover:bg-cyan-700 text-white flex-1">
              <Send className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white flex-1"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Scheduled Broadcasts List */}
      <div className="space-y-3">
        {schedules.length === 0 ? (
          <Card className="p-8 bg-slate-900 border border-slate-700 text-center">
            <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">No scheduled broadcasts yet</p>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card
              key={schedule.id}
              className={`p-4 bg-slate-900 border ${
                schedule.status === 'cancelled' ? 'border-red-500/30' : 'border-slate-700'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${severityColors[schedule.severity]}`}>
                        {schedule.severity.toUpperCase()}
                      </span>
                      <span className={`text-xs font-medium ${statusColors[schedule.status]}`}>
                        {schedule.status.toUpperCase()}
                      </span>
                      {schedule.recurring && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400 flex items-center gap-1">
                          <Repeat2 className="w-3 h-3" />
                          {schedule.recurring.pattern}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white">{schedule.title}</h3>
                    <p className="text-sm text-slate-300 mt-1">{schedule.message}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-slate-400">Scheduled</div>
                    <div className="font-medium text-cyan-400">{formatDateTime(schedule.scheduledTime)}</div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-slate-400">Time Until</div>
                    <div className="font-medium text-blue-400">{getTimeUntil(schedule.scheduledTime)}</div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-slate-400">Timezone</div>
                    <div className="font-medium text-slate-300">{schedule.timezone}</div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <div className="text-slate-400">Channels</div>
                    <div className="font-medium text-slate-300">{schedule.channels.length}</div>
                  </div>
                </div>

                {/* Channels */}
                <div className="flex flex-wrap gap-1">
                  {schedule.channels.map((channel) => (
                    <span key={channel} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                      {channel}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-700">
                  {schedule.status === 'scheduled' && (
                    <>
                      <Button className="bg-slate-800 hover:bg-slate-700 text-white text-xs py-1 px-2 flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleCancelSchedule(schedule.id)}
                        className="bg-yellow-900 hover:bg-yellow-800 text-yellow-200 text-xs py-1 px-2 flex-1"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="bg-red-900 hover:bg-red-800 text-red-200 text-xs py-1 px-2 flex-1"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
