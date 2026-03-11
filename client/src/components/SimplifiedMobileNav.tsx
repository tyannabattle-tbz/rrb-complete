import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Menu, X, Home, BarChart3, MessageSquare, Settings, Search, Music, Radio, Zap, MapPin, Globe, Heart, Video, Gamepad2, Share2, Monitor, Headphones, Calendar, Eye, BookOpen, Shield, Bell, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavSection {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
  }[];
}

export function SimplifiedMobileNav() {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navSections: NavSection[] = [
    {
      title: 'Core',
      items: [
        { id: 'nav-home', label: 'Home', icon: Home, path: '/' },
        { id: 'nav-qumus', label: 'QUMUS Control', icon: Monitor, path: '/qumus' },
        { id: 'nav-chat', label: 'AI Chat', icon: MessageSquare, path: '/qumus-chat' },
        { id: 'nav-ecosystem', label: 'Ecosystem', icon: Globe, path: '/ecosystem-dashboard' },
      ],
    },
    {
      title: 'Media & Broadcasting',
      items: [
        { id: 'nav-radio', label: 'RRB Radio', icon: Radio, path: '/rrb-radio' },
        { id: 'nav-live', label: 'Live Stream', icon: Eye, path: '/live' },
        { id: 'nav-studio', label: 'Production Studio', icon: Headphones, path: '/studio' },
        { id: 'nav-broadcast', label: 'Broadcast Hub', icon: Zap, path: '/broadcast-hub' },
        { id: 'nav-hybridcast', label: 'HybridCast', icon: Radio, path: '/hybridcast' },
      ],
    },
    {
      title: 'Events & Community',
      items: [
        { id: 'nav-conventions', label: 'Convention Hub', icon: Calendar, path: '/convention-hub' },
        { id: 'nav-selma', label: 'Selma Jubilee', icon: MapPin, path: '/selma' },
        { id: 'nav-squadd', label: 'SQUADD Goals', icon: Globe, path: '/squadd' },
        { id: 'nav-donate', label: 'Sweet Miracles', icon: Heart, path: '/donate' },
        { id: 'nav-media-blast', label: 'Media Blast', icon: Megaphone, path: '/media-blast' },
      ],
    },
    {
      title: 'Play & Explore',
      items: [
        { id: 'nav-games', label: 'Games Hub', icon: Gamepad2, path: '/games' },
        { id: 'nav-legacy', label: 'Legacy', icon: BookOpen, path: '/legacy' },
        { id: 'nav-music', label: 'Music Library', icon: Music, path: '/music' },
        { id: 'nav-gps', label: 'GPS Radar', icon: MapPin, path: '/gps-radar' },
      ],
    },
    {
      title: 'Management',
      items: [
        { id: 'nav-canryn', label: 'Canryn Production', icon: Shield, path: '/canryn' },
        { id: 'nav-analytics', label: 'Analytics', icon: BarChart3, path: '/listener-analytics' },
        { id: 'nav-notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
        { id: 'nav-settings', label: 'Settings', icon: Settings, path: '/settings' },
      ],
    },
  ];

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '?');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-3 right-3 z-50 h-12 w-12"
        title={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Simplified Navigation Menu */}
      {isOpen && (
        <nav className="fixed top-16 right-0 bottom-0 w-64 bg-background border-l border-border z-40 md:hidden overflow-y-auto">
          <div className="p-4 space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full justify-start gap-3 h-12 px-3 ${
                          active
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate text-sm">{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
