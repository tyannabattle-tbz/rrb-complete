import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { X, Home, Radio, Music, Zap, Heart, BarChart3, MessageSquare, MapPin, Globe, Mic, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  section: 'qumus' | 'rrb' | 'shared';
}

export function MobileNavigationDrawer() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);

  // Determine if we're on RRB or QUMUS site
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isRRBDomain = hostname.includes('rockinrockinboogie.com') || hostname.includes('rrb');

  const qumusNavItems: NavItem[] = [
    { label: 'Home', icon: Home, path: '/', section: 'qumus' },
    { label: 'Dashboard', icon: BarChart3, path: '/comprehensive-dashboard', section: 'qumus' },
    { label: 'Chat', icon: MessageSquare, path: '/qumus-chat', section: 'qumus' },
    { label: 'GPS Map', icon: MapPin, path: '/gps-radar', section: 'qumus' },
  ];

  const rrbNavItems: NavItem[] = [
    { label: 'Home', icon: Home, path: '/', section: 'rrb' },
    { label: 'Radio Station', icon: Radio, path: '/radio-station', section: 'rrb' },
    { label: 'Music Library', icon: Music, path: '/music', section: 'rrb' },
    { label: 'Podcasts', icon: Mic, path: '/podcasts', section: 'rrb' },
    { label: 'Solbones Game', icon: Zap, path: '/solbones', section: 'rrb' },
    { label: 'Donations', icon: Heart, path: '/donate', section: 'rrb' },
  ];

  const sharedNavItems: NavItem[] = [
    { label: 'Settings', icon: Settings, path: '/settings', section: 'shared' },
  ];

  const navItems = isRRBDomain ? rrbNavItems : qumusNavItems;
  const allNavItems = [...navItems, ...sharedNavItems];

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-72 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-left">
            {isRRBDomain ? 'RRB Navigation' : 'QUMUS Navigation'}
          </DialogTitle>
        </DialogHeader>

        <nav className="flex flex-col gap-2 mt-6">
          {/* Main Navigation Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground px-2 py-2">
              {isRRBDomain ? 'RRB' : 'QUMUS'}
            </h3>
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.path)}
                className="w-full justify-start gap-3 text-sm"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>

          {/* Shared Navigation Items */}
          {sharedNavItems.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground px-2 py-2">
                Settings
              </h3>
              {sharedNavItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  className="w-full justify-start gap-3 text-sm"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Cross-Site Navigation */}
          <div className="space-y-2 border-t pt-4">
            <h3 className="text-xs font-semibold text-muted-foreground px-2 py-2">
              Switch Site
            </h3>
            {isRRBDomain ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = '/';
                  setOpen(false);
                }}
                className="w-full justify-start gap-3 text-sm"
              >
                <Zap className="w-4 h-4" />
                <span>Go to QUMUS</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = '/';
                  setOpen(false);
                }}
                className="w-full justify-start gap-3 text-sm"
              >
                <Radio className="w-4 h-4" />
                <span>Go to RRB Radio</span>
              </Button>
            )}
          </div>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
