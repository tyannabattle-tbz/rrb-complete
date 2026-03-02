import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Download, Trash2, Plus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ScheduledExportManager() {
  const [schedules, setSchedules] = useState<any[]>([
    {
      id: 'schedule-1',
      frequency: 'daily',
      time: '02:00',
      format: 'json',
      destination: 'cloud',
      retentionDays: 30,
      isActive: true,
      nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000),
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    frequency: 'daily',
    time: '02:00',
    format: 'json',
    destination: 'cloud',
    retentionDays: 30,
  });

  const handleAddSchedule = () => {
    if (editingId) {
      setSchedules(
        schedules.map((s) =>
          s.id === editingId
            ? {
                ...s,
                ...formData,
                nextRun: calculateNextRun(formData.frequency, formData.time),
              }
            : s
        )
      );
      toast.success('Schedule updated');
      setEditingId(null);
    } else {
      const newSchedule = {
        id: `schedule-${Date.now()}`,
        ...formData,
        isActive: true,
        nextRun: calculateNextRun(formData.frequency, formData.time),
        lastRun: new Date(0),
      };
      setSchedules([...schedules, newSchedule]);
      toast.success('Schedule created');
    }
    setShowForm(false);
    setFormData({ frequency: 'daily', time: '02:00', format: 'json', destination: 'cloud', retentionDays: 30 });
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
    toast.success('Schedule deleted');
  };

  const handleEditSchedule = (schedule: any) => {
    setFormData({
      frequency: schedule.frequency,
      time: schedule.time,
      format: schedule.format,
      destination: schedule.destination,
      retentionDays: schedule.retentionDays,
    });
    setEditingId(schedule.id);
    setShowForm(true);
  };

  const calculateNextRun = (frequency: string, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);
    if (next <= new Date()) {
      if (frequency === 'daily') next.setDate(next.getDate() + 1);
      else if (frequency === 'weekly') next.setDate(next.getDate() + 7);
      else if (frequency === 'monthly') next.setMonth(next.getMonth() + 1);
    }
    return next;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Scheduled Exports</h1>
          <p className="text-slate-600 mt-2">Manage automatic chat export schedules and backups</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({ frequency: 'daily', time: '02:00', format: 'json', destination: 'cloud', retentionDays: 30 });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="shadow-lg border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Schedule' : 'Create New Schedule'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Format</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Destination</label>
                <select
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="cloud">Cloud Storage</option>
                  <option value="email">Email</option>
                  <option value="local">Local</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700">Retention Days</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.retentionDays}
                  onChange={(e) => setFormData({ ...formData, retentionDays: parseInt(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddSchedule} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {editingId ? 'Update Schedule' : 'Create Schedule'}
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedules List */}
      <div className="space-y-3">
        {schedules.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-600">No scheduled exports yet. Create one to get started.</p>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">
                        {schedule.frequency}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {schedule.format}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {schedule.destination}
                      </Badge>
                      {schedule.isActive && <Badge className="bg-green-600">Active</Badge>}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Scheduled at {schedule.time} | Retention: {schedule.retentionDays} days
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Next Run</p>
                        <p className="font-medium text-slate-900">{formatDate(schedule.nextRun)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Last Run</p>
                        <p className="font-medium text-slate-900">{formatDate(schedule.lastRun)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditSchedule(schedule)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Export History */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Recent Exports
          </CardTitle>
          <CardDescription>Last 5 export operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                id: 'export-1',
                format: 'json',
                size: '2.4 MB',
                date: new Date(Date.now() - 2 * 60 * 60 * 1000),
                status: 'completed',
              },
              {
                id: 'export-2',
                format: 'json',
                size: '2.3 MB',
                date: new Date(Date.now() - 26 * 60 * 60 * 1000),
                status: 'completed',
              },
            ].map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 capitalize">{exp.format} Export</p>
                  <p className="text-sm text-slate-600">{exp.date.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">{exp.size}</span>
                  <Badge className="bg-green-600">{exp.status}</Badge>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
