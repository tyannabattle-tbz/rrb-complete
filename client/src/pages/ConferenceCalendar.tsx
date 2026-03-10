import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Link } from 'wouter';
import { Calendar, ChevronLeft, ChevronRight, Video, Users, Clock, ArrowLeft, Radio, Shield, Cpu } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const platformColors: Record<string, string> = {
  jitsi: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  zoom: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  meet: 'bg-green-500/20 text-green-300 border-green-500/30',
  discord: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  skype: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'rrb-live': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  phone: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const statusColors: Record<string, string> = {
  live: 'bg-red-500 animate-pulse',
  scheduled: 'bg-amber-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-500',
};

export default function ConferenceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get the date range for the current view
  const { startDate, endDate } = useMemo(() => {
    if (view === 'month') {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59);
      // Extend to cover full weeks
      const startOffset = firstDay.getDay();
      const start = new Date(firstDay);
      start.setDate(start.getDate() - startOffset);
      const end = new Date(lastDay);
      const endOffset = 6 - lastDay.getDay();
      end.setDate(end.getDate() + endOffset);
      return { startDate: start.getTime(), endDate: end.getTime() };
    } else {
      const dayOfWeek = currentDate.getDay();
      const start = new Date(currentDate);
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { startDate: start.getTime(), endDate: end.getTime() };
    }
  }, [year, month, view, currentDate]);

  const { data: events } = trpc.conference.getCalendarEvents.useQuery({ startDate, endDate });

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7));
    }
    setCurrentDate(newDate);
  };

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; events: any[] }[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayDate = new Date(d);
      const dayStart = new Date(dayDate).setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayDate).setHours(23, 59, 59, 999);
      
      const dayEvents = (events || []).filter((e: any) => {
        const eventTime = e.scheduled_at || e.created_at;
        return eventTime >= dayStart && eventTime <= dayEnd;
      });

      days.push({
        date: dayDate,
        isCurrentMonth: dayDate.getMonth() === month,
        events: dayEvents,
      });
    }
    return days;
  }, [startDate, endDate, events, month]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-gray-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/conference">
                <button className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-purple-400" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
                  Conference Calendar
                </h1>
                <p className="text-sm text-gray-400">Canryn Production Ecosystem</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Platform badges */}
              <div className="hidden md:flex items-center gap-2 mr-4">
                <span className="flex items-center gap-1 text-xs text-amber-400"><Radio className="w-3 h-3" /> RRB</span>
                <span className="flex items-center gap-1 text-xs text-purple-400"><Cpu className="w-3 h-3" /> TBZ-OS</span>
                <span className="flex items-center gap-1 text-xs text-red-400"><Shield className="w-3 h-3" /> HybridCast</span>
              </div>
              {/* View toggle */}
              <div className="flex bg-gray-800/50 rounded-lg p-1">
                <button
                  onClick={() => setView('month')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'month' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'week' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Week
                </button>
              </div>
              {/* Navigation */}
              <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-semibold min-w-[180px] text-center">
                {view === 'month' ? `${MONTHS[month]} ${year}` : `Week of ${currentDate.toLocaleDateString()}`}
              </span>
              <button onClick={() => navigate(1)} className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-sm bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className={`grid grid-cols-7 gap-1 ${view === 'week' ? '' : ''}`}>
          {calendarDays.map((day, i) => {
            const isToday = day.date.getTime() === today.getTime();
            return (
              <div
                key={i}
                className={`min-h-[120px] rounded-lg border p-2 transition-colors cursor-pointer hover:border-purple-500/40 ${
                  day.isCurrentMonth
                    ? 'bg-gray-900/50 border-gray-800/50'
                    : 'bg-gray-950/30 border-gray-900/30 opacity-50'
                } ${isToday ? 'border-amber-500/50 bg-amber-500/5' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-amber-400' : day.isCurrentMonth ? 'text-gray-300' : 'text-gray-600'}`}>
                  {day.date.getDate()}
                  {isToday && <span className="ml-1 text-xs text-amber-500">Today</span>}
                </div>
                <div className="space-y-1">
                  {day.events.slice(0, 3).map((event: any) => (
                    <button
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-xs border truncate ${platformColors[event.platform] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${statusColors[event.status] || 'bg-gray-500'}`} />
                      {event.title}
                    </button>
                  ))}
                  {day.events.length > 3 && (
                    <div className="text-xs text-gray-500 pl-1">+{day.events.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Event detail modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
            <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${statusColors[selectedEvent.status]}`} />
                    <span className="text-sm text-gray-400 capitalize">{selectedEvent.status}</span>
                    <span className={`px-2 py-0.5 rounded text-xs border ${platformColors[selectedEvent.platform] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                      {selectedEvent.platform}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-white text-xl">&times;</button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Host: {selectedEvent.host_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{selectedEvent.duration_minutes} minutes</span>
                </div>
                {selectedEvent.scheduled_at && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span>{new Date(selectedEvent.scheduled_at).toLocaleString()}</span>
                  </div>
                )}
                {selectedEvent.actual_attendees > 0 && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>{selectedEvent.actual_attendees} attendees</span>
                  </div>
                )}
                {selectedEvent.recording_status === 'available' && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Video className="w-4 h-4" />
                    <span>Recording available</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                {selectedEvent.status === 'live' && (
                  <Link href={`/conference/room/${selectedEvent.id}`}>
                    <button className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                      Join Live
                    </button>
                  </Link>
                )}
                {selectedEvent.status === 'scheduled' && (
                  <Link href={`/conference`}>
                    <button className="flex-1 px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium">
                      RSVP
                    </button>
                  </Link>
                )}
                <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-400">
          <span className="font-medium text-gray-300">Status:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Scheduled</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Completed</span>
          <span className="ml-4 font-medium text-gray-300">Platform:</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">RRB Built-in</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Zoom</span>
          <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30">Google Meet</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Discord</span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-purple-500/10 mt-8 py-4 text-center text-xs text-gray-600">
        Canryn Production Conference System &bull; Powered by QUMUS &bull; Ty Bat Zan, Digital Steward
      </div>
    </div>
  );
}
