import React from 'react';
import { useLocation } from 'wouter';
import { Home, BarChart3, MessageSquare, Settings, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

export function MobileBottomNav() {
  const [location, navigate] = useLocation();

  const navItems: NavItem[] = [
    { id: 'nav-home', label: 'Home', icon: Home, path: '/' },
    { id: 'nav-dashboard', label: 'Dashboard', icon: BarChart3, path: '/comprehensive-dashboard' },
    { id: 'nav-chat', label: 'Chat', icon: MessageSquare, path: '/qumus-chat' },
    { id: 'nav-search', label: 'Search', icon: Search, path: '/search' },
    { id: 'nav-settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '?');
  };

  return (
    <nav className="md:hidden w-full z-40 bg-background border-t border-border">
      <div className="flex items-stretch justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-none transition-colors ${
                active
                  ? 'bg-primary/10 text-primary border-t-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
