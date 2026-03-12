import React from 'react';
import { useLocation, Link } from 'wouter';
import { Home, BarChart3, MessageSquare, Settings, Search, Radio, Heart, Zap, Earth, Menu, Headphones, Music, Calendar, Gamepad2, BookOpen, Monitor, Eye, MapPin } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  path: string;
}

export function MobileBottomNav() {
  const [location] = useLocation();
  const [showMore, setShowMore] = React.useState(false);

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
