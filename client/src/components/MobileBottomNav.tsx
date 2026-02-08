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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 h-14 w-14 rounded-lg transition-colors ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
