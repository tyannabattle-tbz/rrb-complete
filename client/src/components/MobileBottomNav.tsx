import React from 'react';
import { useLocation, Link } from 'wouter';
import { Home, BarChart3, MessageSquare, Settings, Search, Radio, Heart, Zap, Earth, Menu, Headphones, Music, Calendar, Gamepad2, BookOpen, Monitor, Eye, MapPin, PhoneCall, Users } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  path: string;
}

// Try to import MeetingContext — if it fails, we just won't show the rejoin button
let useMeetingHook: (() => { meeting: { isInMeeting: boolean; roomLabel: string; participants: any[] }; isOnMeetingPage: boolean }) | null = null;
try {
  const mod = require('@/contexts/MeetingContext');
  useMeetingHook = mod.useMeeting;
} catch {}

function MeetingRejoinBanner() {
  const [, setLocation] = useLocation();
  
  // Use dynamic import approach
  const [meetingState, setMeetingState] = React.useState<{ isInMeeting: boolean; roomLabel: string; participantCount: number; isOnMeetingPage: boolean } | null>(null);
  
  React.useEffect(() => {
    // Check if MeetingContext is available
    try {
      if (useMeetingHook) {
        // We can't call hooks conditionally, so we use a wrapper approach
      }
    } catch {}
  }, []);

  // This component will be wrapped in a try-catch at render time
  return null;
}

export function MobileBottomNav() {
  const [location] = useLocation();
  const [showMore, setShowMore] = React.useState(false);

  // Check if user is in an active meeting (read from global state)
  const [isInMeeting, setIsInMeeting] = React.useState(false);
  const [meetingRoom, setMeetingRoom] = React.useState('');
  const [meetingParticipants, setMeetingParticipants] = React.useState(0);
  
  // Poll for meeting state from the global meeting context via DOM attribute
  React.useEffect(() => {
    const checkMeeting = () => {
      const meetingEl = document.getElementById('persistent-meeting-state');
      if (meetingEl) {
        const inMeeting = meetingEl.getAttribute('data-in-meeting') === 'true';
        const room = meetingEl.getAttribute('data-room-label') || '';
        const participants = parseInt(meetingEl.getAttribute('data-participants') || '0');
        setIsInMeeting(inMeeting);
        setMeetingRoom(room);
        setMeetingParticipants(participants);
      }
    };
    checkMeeting();
    const interval = setInterval(checkMeeting, 2000);
    return () => clearInterval(interval);
  }, []);

  const isOnMeetingPage = location === '/meeting' || location.startsWith('/meeting?');

  const navItems: (NavItem & { external?: boolean })[] = [
    { id: 'nav-home', label: 'Home', icon: Home, path: '/' },
    { id: 'nav-qumus', label: 'QUMUS', icon: Monitor, path: '/qumus' },
    { id: 'nav-radio', label: 'Radio', icon: Music, path: '/rrb-radio' },
    { id: 'nav-studio', label: 'Studio', icon: Headphones, path: '/studio' },
    { id: 'nav-donate', label: 'Donate', icon: Heart, path: '/donate' },
    { id: 'nav-chat', label: 'Chat', icon: MessageSquare, path: '/qumus-chat' },
    { id: 'nav-live', label: 'Live', icon: Eye, path: '/live' },
    { id: 'nav-hybridcast', label: 'HybridCast', icon: Radio, path: '/hybridcast' },
    { id: 'nav-conventions', label: 'Events', icon: Calendar, path: '/convention-hub' },
    { id: 'nav-ecosystem', label: 'Ecosystem', icon: Earth, path: '/ecosystem' },
    { id: 'nav-games', label: 'Games', icon: Gamepad2, path: '/games' },
    { id: 'nav-legacy', label: 'Legacy', icon: BookOpen, path: '/legacy' },
    { id: 'nav-gps', label: 'GPS Map', icon: MapPin, path: '/gps-radar' },
    { id: 'nav-settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '?');
  };

  const visibleItems = navItems.slice(0, 5);
  const moreItems = navItems.slice(5);

  return (
    <>
      {/* Rejoin Meeting Banner — shows above bottom nav when in a meeting but not on meeting page */}
      {isInMeeting && !isOnMeetingPage && (
        <div className="md:hidden fixed bottom-20 left-0 right-0 z-50">
          <Link
            href="/meeting"
            className="flex items-center justify-between mx-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg shadow-green-900/40 border border-green-500/30"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <PhoneCall size={20} className="text-white" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Rejoin Meeting</p>
                <p className="text-green-100 text-xs">{meetingRoom} {meetingParticipants > 0 ? `• ${meetingParticipants + 1} in room` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-green-200" />
              <span className="text-white text-xs font-medium bg-green-700/50 px-2 py-1 rounded-full">Tap to return</span>
            </div>
          </Link>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-800/80 border-t border-slate-700 backdrop-blur-md">
        <div className="flex items-center justify-around h-20 px-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            if (item.external) {
              return (
                <a
                  key={item.id}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  title={item.label}
                >
                  <Icon size={24} />
                  <span className="text-xs mt-1 font-medium truncate max-w-[50px]">{item.label}</span>
                </a>
              );
            }
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all ${
                  active
                    ? 'bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
                title={item.label}
              >
                <Icon size={24} />
                <span className="text-xs mt-1 font-medium truncate max-w-[50px]">{item.label}</span>
              </Link>
            );
          })}

          <div className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex flex-col items-center justify-center w-14 h-14 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
              title="More"
            >
              <Menu size={24} />
              <span className="text-xs mt-1 font-medium">More</span>
            </button>

            {showMore && (
              <div className="absolute bottom-20 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 min-w-max">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setShowMore(false)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all text-sm ${
                        active
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="h-20 md:hidden" />
    </>
  );
}
