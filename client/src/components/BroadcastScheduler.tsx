import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Plus, Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduledBroadcast {
  id: string;
  title: string;
  date: string;
  startTime: string;
  duration: number;
  recurring: boolean;
  recurrencePattern?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

export function BroadcastScheduler() {
  const [broadcasts, setBroadcasts] = useState<ScheduledBroadcast[]>([
    {
      id: '1',
      title: 'Top of the Sol News',
      date: '2026-02-08',
      startTime: '08:00',
      duration: 30,
      recurring: true,
      recurrencePattern: 'daily',
      status: 'scheduled',
    },
    {
      id: '2',
      title: 'Evening Talk Show',
      date: '2026-02-08',
      startTime: '18:00',
      duration: 60,
      recurring: true,
      recurrencePattern: 'weekdays',
      status: 'scheduled',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    duration: 30,
    recurring: false,
    recurrencePattern: 'none',
  });

  const addBroadcast = () => {
    if (!formData.title || !formData.date || !formData.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newBroadcast: ScheduledBroadcast = {
      id: `broadcast-${Date.now()}`,
      title: formData.title,
      date: formData.date,
      startTime: formData.startTime,
      duration: formData.duration,
      recurring: formData.recurring,
      recurrencePattern: formData.recurring ? formData.recurrencePattern : undefined,
      status: 'scheduled',
    };

    setBroadcasts([...broadcasts, newBroadcast]);
    setFormData({
      title: '',
      date: '',
      startTime: '',
      duration: 30,
      recurring: false,
      recurrencePattern: 'none',
    });
    setShowForm(false);
    toast.success('Broadcast scheduled successfully');
  };

  const deleteBroadcast = (id: string) => {
    setBroadcasts(broadcasts.filter(b => b.id !== id));
    toast.success('Broadcast removed');
  };

  const checkConflicts = () => {
    const conflicts: string[] = [];
    for (let i = 0; i < broadcasts.length; i++) {
      for (let j = i + 1; j < broadcasts.length; j++) {
        const b1 = broadcasts[i];
        const b2 = broadcasts[j];
        if (b1.date === b2.date) {
          const start1 = parseInt(b1.startTime.replace(':', ''));
          const end1 = start1 + b1.duration;
          const start2 = parseInt(b2.startTime.replace(':', ''));
          const end2 = start2 + b2.duration;
          
          if ((start1 < end2 && start2 < end1) || (start2 < end1 && start1 < end2)) {
            conflicts.push(`"${b1.title}" conflicts with "${b2.title}" on ${b1.date}`);
          }
        }
      }
    }
    return conflicts;
  };

  const conflicts = checkConflicts();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Broadcast Scheduler</h2>
          <p className="text-slate-400">Manage and organize your broadcast schedule</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Broadcast
        </Button>
      </div>

      {/* Conflict Warnings */}
      {conflicts.length > 0 && (
        <Card className="bg-red-900/20 border-red-700 p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-red-300 font-semibold">Schedule Conflicts Detected</p>
              {conflicts.map((conflict, i) => (
                <p key={i} className="text-sm text-red-200">{conflict}</p>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Add Form */}
      {showForm && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Schedule New Broadcast</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Title</label>
                <Input
                  placeholder="Broadcast title..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Start Time</label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Duration (minutes)</label>
                <Input
                  type="number"
                  min="5"
                  max="480"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.recurring}
                  onChange={e => setFormData({ ...formData, recurring: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-slate-300">Recurring broadcast</span>
              </label>

              {formData.recurring && (
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Recurrence Pattern</label>
                  <select
                    value={formData.recurrencePattern}
                    onChange={e => setFormData({ ...formData, recurrencePattern: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays (Mon-Fri)</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={addBroadcast}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Schedule
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1 border-slate-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Calendar View */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Scheduled Broadcasts
        </h3>
        <div className="space-y-3">
          {broadcasts.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No broadcasts scheduled</p>
          ) : (
            broadcasts.map(broadcast => (
              <div key={broadcast.id} className="bg-slate-700 rounded p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-white">{broadcast.title}</h4>
                    {broadcast.recurring && (
                      <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                        {broadcast.recurrencePattern}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      broadcast.status === 'scheduled' ? 'bg-yellow-600/20 text-yellow-300' :
                      broadcast.status === 'live' ? 'bg-green-600/20 text-green-300' :
                      broadcast.status === 'completed' ? 'bg-slate-600/20 text-slate-300' :
                      'bg-red-600/20 text-red-300'
                    }`}>
                      {broadcast.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(broadcast.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {broadcast.startTime} - {String(Math.floor(broadcast.duration / 60)).padStart(2, '0')}:{String(broadcast.duration % 60).padStart(2, '0')}
                    </span>
                    <span>{broadcast.duration}m</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-slate-600">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteBroadcast(broadcast.id)}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Total Scheduled</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{broadcasts.length}</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Recurring</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">{broadcasts.filter(b => b.recurring).length}</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Total Duration</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{Math.floor(broadcasts.reduce((sum, b) => sum + b.duration, 0) / 60)}h</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-slate-400 text-sm">Conflicts</p>
          <p className={`text-3xl font-bold mt-2 ${conflicts.length > 0 ? 'text-red-400' : 'text-green-400'}`}>{conflicts.length}</p>
        </Card>
      </div>
    </div>
  );
}
