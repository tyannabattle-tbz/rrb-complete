import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Bell,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Share2,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Zap,
  TrendingUp,
  Radio,
} from 'lucide-react';

interface ScheduledEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  channel: string;
  category: string;
  expectedViewers: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  notificationsSent: number;
  remindersSet: number;
  thumbnail?: string;
}

const SCHEDULED_EVENTS: ScheduledEvent[] = [
  {
    id: 'event_1',
    title: 'Weekly Music Showcase',
    description: 'Live performance featuring emerging artists and special guests',
    startTime: '2026-02-20 19:00',
    endTime: '2026-02-20 21:00',
    channel: 'Music & Radio',
    category: 'Music',
    expectedViewers: 5000,
    status: 'scheduled',
    notificationsSent: 0,
    remindersSet: 0,
  },
  {
    id: 'event_2',
    title: 'Community Q&A Session',
    description: 'Direct interaction with creators and community members',
    startTime: '2026-02-21 15:00',
    endTime: '2026-02-21 16:30',
    channel: 'Community',
    category: 'Community',
    expectedViewers: 2000,
    status: 'scheduled',
    notificationsSent: 0,
    remindersSet: 0,
  },
  {
    id: 'event_3',
    title: 'Healing Frequencies Meditation',
    description: 'Guided meditation with Solfeggio frequencies for wellness',
    startTime: '2026-02-22 08:00',
    endTime: '2026-02-22 09:00',
    channel: 'Listen Live',
    category: 'Wellness',
    expectedViewers: 3000,
    status: 'scheduled',
    notificationsSent: 0,
    remindersSet: 0,
  },
  {
    id: 'event_4',
    title: 'Solbones Tournament',
    description: 'Live gaming tournament with prize pool',
    startTime: '2026-02-23 20:00',
    endTime: '2026-02-23 23:00',
    channel: 'Studio',
    category: 'Gaming',
    expectedViewers: 8000,
    status: 'scheduled',
    notificationsSent: 0,
    remindersSet: 0,
  },
  {
    id: 'event_5',
    title: 'Legacy Stories Archive',
    description: 'Documentary screening and discussion',
    startTime: '2026-02-24 18:00',
    endTime: '2026-02-24 20:00',
    channel: 'The Legacy',
    category: 'Documentary',
    expectedViewers: 4000,
    status: 'scheduled',
    notificationsSent: 0,
    remindersSet: 0,
  },
];

export function EventScheduling() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'upcoming' | 'analytics'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const upcomingEvents = SCHEDULED_EVENTS.filter((e) => e.status === 'scheduled').sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const filteredEvents = upcomingEvents.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.channel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpectedViewers = upcomingEvents.reduce((sum, e) => sum + e.expectedViewers, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-8 h-8 text-blue-500" /> Event Scheduling
            </h1>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Create Event
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            {[
              { id: 'calendar', label: 'Calendar View' },
              { id: 'upcoming', label: 'Upcoming Events' },
              { id: 'analytics', label: 'Analytics' },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Calendar View Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Month Overview */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">February 2026</h2>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-gray-400 font-semibold py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 28 }).map((_, i) => {
                  const date = i + 1;
                  const hasEvent = upcomingEvents.some((e) =>
                    e.startTime.startsWith(`2026-02-${String(date).padStart(2, '0')}`)
                  );
                  return (
                    <div
                      key={date}
                      className={`p-3 rounded text-center font-semibold cursor-pointer transition ${
                        hasEvent
                          ? 'bg-blue-900 text-blue-200 border border-blue-700'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {date}
                      {hasEvent && <div className="text-xs mt-1">●</div>}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Event Details */}
            {selectedEvent && (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedEvent.title}</h3>
                    <p className="text-gray-400 mt-2">{selectedEvent.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                    ✕
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-gray-700 rounded">
                    <p className="text-gray-400 text-sm">Start Time</p>
                    <p className="text-white font-semibold mt-1">{selectedEvent.startTime}</p>
                  </div>
                  <div className="p-3 bg-gray-700 rounded">
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white font-semibold mt-1">2 hours</p>
                  </div>
                  <div className="p-3 bg-gray-700 rounded">
                    <p className="text-gray-400 text-sm">Channel</p>
                    <p className="text-white font-semibold mt-1">{selectedEvent.channel}</p>
                  </div>
                  <div className="p-3 bg-gray-700 rounded">
                    <p className="text-gray-400 text-sm">Expected Viewers</p>
                    <p className="text-white font-semibold mt-1">{selectedEvent.expectedViewers.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Bell className="w-4 h-4" /> Send Notifications
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" /> Share Event
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Edit2 className="w-4 h-4" /> Edit
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Upcoming Events Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            {/* Search */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-4 py-2"
              />
            </Card>

            {/* Events List */}
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="bg-gray-800 border-gray-700 p-4 hover:bg-gray-750 transition cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{event.title}</h3>
                        <span className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded">
                          {event.category}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {event.startTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Radio className="w-4 h-4" /> {event.channel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> {event.expectedViewers.toLocaleString()} expected
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Bell className="w-4 h-4" /> Notify
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Share2 className="w-4 h-4" /> Share
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700 p-4">
                <p className="text-gray-400 text-sm">Scheduled Events</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{upcomingEvents.length}</p>
              </Card>
              <Card className="bg-gray-800 border-gray-700 p-4">
                <p className="text-gray-400 text-sm">Expected Total Viewers</p>
                <p className="text-3xl font-bold text-green-400 mt-2">
                  {totalExpectedViewers.toLocaleString()}
                </p>
              </Card>
              <Card className="bg-gray-800 border-gray-700 p-4">
                <p className="text-gray-400 text-sm">Avg Viewers per Event</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">
                  {Math.round(totalExpectedViewers / upcomingEvents.length).toLocaleString()}
                </p>
              </Card>
              <Card className="bg-gray-800 border-gray-700 p-4">
                <p className="text-gray-400 text-sm">Notifications Sent</p>
                <p className="text-3xl font-bold text-orange-400 mt-2">
                  {upcomingEvents.reduce((sum, e) => sum + e.notificationsSent, 0)}
                </p>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Event Categories</h3>
              <div className="space-y-3">
                {['Music', 'Community', 'Wellness', 'Gaming', 'Documentary'].map((category) => {
                  const count = upcomingEvents.filter((e) => e.category === category).length;
                  const total = upcomingEvents.length;
                  return (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">{category}</span>
                        <span className="text-white font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(count / total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Notification Strategy</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg border border-blue-700">
                  <p className="text-blue-300 text-sm">📧 Email Reminders</p>
                  <p className="text-white font-semibold mt-2">24 hours & 1 hour before</p>
                  <p className="text-blue-200 text-xs mt-2">Sent to {(totalExpectedViewers * 0.7).toLocaleString()} subscribers</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-900 to-green-800 rounded-lg border border-green-700">
                  <p className="text-green-300 text-sm">🔔 Push Notifications</p>
                  <p className="text-white font-semibold mt-2">30 min before & at start time</p>
                  <p className="text-green-200 text-xs mt-2">Sent to {(totalExpectedViewers * 0.5).toLocaleString()} app users</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-900 to-purple-800 rounded-lg border border-purple-700">
                  <p className="text-purple-300 text-sm">📱 SMS Reminders</p>
                  <p className="text-white font-semibold mt-2">15 min before start</p>
                  <p className="text-purple-200 text-xs mt-2">Sent to {(totalExpectedViewers * 0.2).toLocaleString()} premium members</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
