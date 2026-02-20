import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Clock, Radio, Video, Mic, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ScheduleSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  contentType: string;
  priority: number;
}

interface ScheduleContent {
  id: string;
  title: string;
  duration: number;
  contentType: string;
  fileUrl: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CONTENT_TYPES = [
  { id: 'radio', name: 'Radio', icon: Radio, color: 'bg-blue-100 text-blue-700' },
  { id: 'video', name: 'Video', icon: Video, color: 'bg-purple-100 text-purple-700' },
  { id: 'podcast', name: 'Podcast', icon: Mic, color: 'bg-green-100 text-green-700' },
  { id: 'commercial', name: 'Commercial', icon: Zap, color: 'bg-yellow-100 text-yellow-700' },
];

export function ScheduleManager() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: '09:00',
    endTime: '10:00',
    contentType: 'radio',
  });

  // Fetch schedule
  const { data: scheduleData } = trpc.schedule.getTodaySchedule.useQuery({
    dayOfWeek: selectedDay,
  });

  useEffect(() => {
    if (scheduleData) {
      setSchedule(scheduleData as ScheduleSlot[]);
    }
  }, [scheduleData]);

  const handleAddSlot = async () => {
    // Add new schedule slot
    setShowAddSlot(false);
    setNewSlot({
      startTime: '09:00',
      endTime: '10:00',
      contentType: 'radio',
    });
  };

  const getContentTypeIcon = (contentType: string) => {
    const type = CONTENT_TYPES.find(t => t.id === contentType);
    return type || CONTENT_TYPES[0];
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="w-full space-y-6 bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
      {/* Header */}
      <div className="rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">24/7 Content Schedule</h1>
        <p className="mt-2 text-lg font-semibold">Qumus Autonomous Broadcast Manager</p>
        <p className="mt-2 text-sm opacity-90">
          Manage radio, video, podcasts, and commercials for continuous airwave coverage
        </p>
      </div>

      {/* Day Selector */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, index) => (
          <button
            key={day}
            onClick={() => setSelectedDay(index)}
            className={`p-3 rounded-lg font-semibold transition-all ${
              selectedDay === index
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300'
            }`}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      {/* Schedule Timeline */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{DAYS[selectedDay]} Schedule</h2>
          <Button
            onClick={() => setShowAddSlot(!showAddSlot)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
          </Button>
        </div>

        {/* Add Slot Form */}
        {showAddSlot && (
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Start Time</label>
                <Input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">End Time</label>
                <Input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Content Type</label>
                <select
                  value={newSlot.contentType}
                  onChange={(e) => setNewSlot({ ...newSlot, contentType: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {CONTENT_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddSlot} className="bg-indigo-600 hover:bg-indigo-700">
                Save Slot
              </Button>
              <Button
                onClick={() => setShowAddSlot(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Schedule Slots */}
        <div className="space-y-3">
          {schedule.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No schedule slots for this day</p>
            </div>
          ) : (
            schedule.map((slot) => {
              const contentType = getContentTypeIcon(slot.contentType);
              const Icon = contentType.icon;

              return (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${contentType.color} bg-white`}
                >
                  <div className="flex items-center gap-4">
                    <Icon className="w-6 h-6" />
                    <div>
                      <p className="font-semibold text-gray-800">{contentType.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Slots</p>
          <p className="text-2xl font-bold text-indigo-600">{schedule.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Content Types</p>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(schedule.map(s => s.contentType)).size}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Coverage</p>
          <p className="text-2xl font-bold text-green-600">24/7</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Autonomy</p>
          <p className="text-2xl font-bold text-blue-600">90%</p>
        </Card>
      </div>

      {/* Content Library Preview */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Available Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Top of the Sol Show', type: 'radio', duration: 120 },
            { title: 'News Update', type: 'video', duration: 10 },
            { title: 'Tech Podcast', type: 'podcast', duration: 45 },
            { title: 'Product Ad', type: 'commercial', duration: 30 },
          ].map((content, idx) => {
            const contentType = getContentTypeIcon(content.type);
            const Icon = contentType.icon;

            return (
              <div key={`item-${idx}`} className={`p-4 rounded-lg ${contentType.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{content.title}</span>
                </div>
                <p className="text-sm opacity-75">{content.duration} minutes</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
