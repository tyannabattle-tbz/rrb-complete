'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock, Radio, Users } from 'lucide-react';

export interface ScheduledShow {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelName: string;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  djName: string;
  expectedListeners: number;
  isRecurring: boolean;
  recurringDays?: number[]; // 0-6 for Sun-Sat
}

export default function ShowScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shows, setShows] = useState<ScheduledShow[]>([
    {
      id: '1',
      title: 'Morning Drive Time',
      description: 'High-energy morning show',
      channelId: 'music-rock',
      channelName: 'Rock Legends',
      startTime: new Date(2026, 1, 21, 6, 0).getTime(),
      endTime: new Date(2026, 1, 21, 10, 0).getTime(),
      djName: 'DJ Alex',
      expectedListeners: 2500,
      isRecurring: true,
      recurringDays: [1, 2, 3, 4, 5], // Mon-Fri
    },
    {
      id: '2',
      title: 'Afternoon Jazz Sessions',
      description: 'Smooth jazz and improvisation',
      channelId: 'music-jazz',
      channelName: 'Jazz Nights',
      startTime: new Date(2026, 1, 21, 14, 0).getTime(),
      endTime: new Date(2026, 1, 21, 18, 0).getTime(),
      djName: 'DJ Marcus',
      expectedListeners: 1800,
      isRecurring: true,
      recurringDays: [0, 1, 2, 3, 4, 5, 6], // Every day
    },
    {
      id: '3',
      title: 'Evening Prime Time',
      description: 'Prime time entertainment',
      channelId: 'talk-podcast',
      channelName: 'Podcast Central',
      startTime: new Date(2026, 1, 21, 19, 0).getTime(),
      endTime: new Date(2026, 1, 21, 22, 0).getTime(),
      djName: 'DJ Sarah',
      expectedListeners: 3200,
      isRecurring: true,
      recurringDays: [1, 2, 3, 4, 5], // Mon-Fri
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedShow, setSelectedShow] = useState<ScheduledShow | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    channelName: '',
    djName: '',
    startTime: '',
    endTime: '',
    expectedListeners: 1000,
  });

  // Get days in month
  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month
  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get shows for a specific day
  const getShowsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return shows.filter(show => {
      const showDate = new Date(show.startTime);
      return showDate.getDate() === day &&
        showDate.getMonth() === currentDate.getMonth() &&
        showDate.getFullYear() === currentDate.getFullYear();
    });
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    const firstDay = firstDayOfMonth(currentDate);
    const daysCount = daysInMonth(currentDate);

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysCount; i++) {
      days.push(i);
    }

    return days;
  }, [currentDate]);

  // Handle form submission
  const handleAddShow = () => {
    if (!formData.title || !formData.channelName || !formData.startTime) {
      alert('Please fill in all required fields');
      return;
    }

    const newShow: ScheduledShow = {
      id: `show-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      channelId: formData.channelName.toLowerCase().replace(/\s+/g, '-'),
      channelName: formData.channelName,
      startTime: new Date(formData.startTime).getTime(),
      endTime: new Date(formData.endTime).getTime(),
      djName: formData.djName,
      expectedListeners: formData.expectedListeners,
      isRecurring: false,
    };

    setShows([...shows, newShow]);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      channelName: '',
      djName: '',
      startTime: '',
      endTime: '',
      expectedListeners: 1000,
    });
  };

  // Handle delete show
  const handleDeleteShow = (id: string) => {
    setShows(shows.filter(s => s.id !== id));
  };

  // Format time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Month/Year display
  const monthYear = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📅 Show Schedule Calendar</h1>
          <p className="text-slate-400">Manage DJ shows and broadcasts across all channels</p>
        </div>

        {/* Calendar Controls */}
        <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white min-w-48 text-center">{monthYear}</h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Schedule Show
            </button>
          </div>

          {/* Add Show Form */}
          {showForm && (
            <div className="bg-slate-700/50 border border-orange-500/30 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Schedule New Show</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Show Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Channel Name"
                  value={formData.channelName}
                  onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                  className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="DJ Name"
                  value={formData.djName}
                  onChange={(e) => setFormData({ ...formData, djName: e.target.value })}
                  className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="number"
                  placeholder="Expected Listeners"
                  value={formData.expectedListeners}
                  onChange={(e) => setFormData({ ...formData, expectedListeners: parseInt(e.target.value) })}
                  className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>
              <textarea
                placeholder="Show Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 mb-4"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddShow}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all"
                >
                  Schedule
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day names */}
            {dayNames.map(day => (
              <div key={day} className="text-center text-slate-400 font-semibold py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const dayShows = day ? getShowsForDay(day) : [];
              const isToday = day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 rounded-lg border transition-all ${
                    day
                      ? isToday
                        ? 'bg-orange-500/20 border-orange-500'
                        : 'bg-slate-700/30 border-slate-600 hover:border-purple-500'
                      : 'bg-slate-800/20 border-slate-700'
                  }`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-orange-400' : 'text-slate-300'}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayShows.map(show => (
                          <div
                            key={show.id}
                            className="bg-purple-600/40 border border-purple-500/50 rounded px-1 py-1 text-xs text-slate-200 cursor-pointer hover:bg-purple-600/60 group relative"
                            onClick={() => setSelectedShow(show)}
                          >
                            <div className="font-semibold truncate">{show.title}</div>
                            <div className="text-xs text-slate-400">{formatTime(show.startTime)}</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteShow(show.id);
                              }}
                              className="absolute top-0 right-0 p-1 bg-red-600 opacity-0 group-hover:opacity-100 rounded transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Show Details */}
        {selectedShow && (
          <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedShow.title}</h3>
                <p className="text-slate-400">{selectedShow.description}</p>
              </div>
              <button
                onClick={() => setSelectedShow(null)}
                className="text-slate-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Channel</div>
                <div className="text-white font-semibold flex items-center gap-2">
                  <Radio className="w-4 h-4 text-orange-400" />
                  {selectedShow.channelName}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">DJ</div>
                <div className="text-white font-semibold">{selectedShow.djName}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Time</div>
                <div className="text-white font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  {formatTime(selectedShow.startTime)} - {formatTime(selectedShow.endTime)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Expected Listeners</div>
                <div className="text-white font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  {selectedShow.expectedListeners.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                handleDeleteShow(selectedShow.id);
                setSelectedShow(null);
              }}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Show
            </button>
          </div>
        )}

        {/* Upcoming Shows */}
        <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">📺 Upcoming Shows</h3>
          <div className="space-y-3">
            {shows
              .sort((a, b) => a.startTime - b.startTime)
              .slice(0, 10)
              .map(show => (
                <div key={show.id} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{show.title}</h4>
                      <div className="text-sm text-slate-400 mt-1">
                        {new Date(show.startTime).toLocaleString()} on {show.channelName}
                      </div>
                      <div className="text-sm text-slate-400">DJ: {show.djName} • {show.expectedListeners.toLocaleString()} expected listeners</div>
                    </div>
                    <button
                      onClick={() => handleDeleteShow(show.id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
