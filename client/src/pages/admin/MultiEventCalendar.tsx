/**
 * Multi-Event Calendar Management
 * Centralized calendar view and event management
 */

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Copy, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CalendarEvent {
  id: string;
  name: string;
  date: Date;
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  panelistCount: number;
  confirmedCount: number;
}

interface DayEvents {
  date: Date;
  events: CalendarEvent[];
  dayOfWeek: string;
}

export const MultiEventCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');

  // Mock events
  const mockEvents: CalendarEvent[] = [
    {
      id: 'event-1',
      name: 'UN WCS Parallel Event',
      date: new Date(2026, 2, 17, 9, 0),
      status: 'scheduled',
      panelistCount: 20,
      confirmedCount: 15,
    },
    {
      id: 'event-2',
      name: 'Community Broadcast',
      date: new Date(2026, 2, 20, 14, 0),
      status: 'scheduled',
      panelistCount: 8,
      confirmedCount: 6,
    },
    {
      id: 'event-3',
      name: 'Workshop Series',
      date: new Date(2026, 2, 25, 10, 0),
      status: 'draft',
      panelistCount: 12,
      confirmedCount: 5,
    },
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getDayEvents = (day: number): CalendarEvent[] => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return mockEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'live':
        return 'bg-red-500';
      case 'completed':
        return 'bg-green-500';
      case 'draft':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-800';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'live':
        return 'LIVE';
      case 'completed':
        return 'Completed';
      case 'draft':
        return 'Draft';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const upcomingEvents = mockEvents
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Event Calendar
          </h2>
          <p className="text-gray-400 text-sm mt-1">Manage multiple broadcasts and events</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Event
        </Button>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-2">
        {(['month', 'week', 'list'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded capitalize font-medium transition-colors ${
              viewMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{monthName}</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-slate-700 rounded transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-slate-700 rounded transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-gray-400 text-sm font-semibold py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-slate-700/30 rounded p-2 min-h-24"></div>
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getDayEvents(day);
                const isToday =
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`rounded p-2 min-h-24 cursor-pointer transition-colors ${
                      isToday ? 'bg-blue-900/50 border-2 border-blue-500' : 'bg-slate-700/50 hover:bg-slate-700'
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-2 py-1 rounded text-white truncate ${getStatusColor(event.status)}`}
                          title={event.name}
                        >
                          {event.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">All Events</CardTitle>
            <CardDescription>Complete list of scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-700/80 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{event.name}</h4>
                    <p className="text-sm text-gray-400">
                      {new Date(event.date).toLocaleString()}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span>Panelists: {event.panelistCount}</span>
                      <span>Confirmed: {event.confirmedCount}</span>
                      <span className="text-blue-400">
                        {((event.confirmedCount / event.panelistCount) * 100).toFixed(0)}% confirmed
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-sm font-medium text-white ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-slate-600 rounded transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-slate-600 rounded transition-colors">
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-slate-600 rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events Summary */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>Next 5 scheduled events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => {
                const daysUntil = Math.ceil(
                  (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-slate-700 rounded"
                  >
                    <div>
                      <p className="text-white font-medium">{event.name}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.date).toLocaleDateString()} at{' '}
                        {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-400">{daysUntil} days away</p>
                      <p className="text-xs text-gray-400">
                        {event.confirmedCount}/{event.panelistCount} confirmed
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Total Events</p>
              <p className="text-3xl font-bold text-blue-400">{mockEvents.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Scheduled</p>
              <p className="text-3xl font-bold text-green-400">
                {mockEvents.filter((e) => e.status === 'scheduled').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Total Panelists</p>
              <p className="text-3xl font-bold text-purple-400">
                {mockEvents.reduce((sum, e) => sum + e.panelistCount, 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Avg Confirmation</p>
              <p className="text-3xl font-bold text-orange-400">
                {mockEvents.length > 0
                  ? (
                      (mockEvents.reduce((sum, e) => sum + e.confirmedCount, 0) /
                        mockEvents.reduce((sum, e) => sum + e.panelistCount, 0)) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
