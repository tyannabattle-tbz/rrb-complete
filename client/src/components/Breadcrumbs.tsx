import { useLocation } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  path: string;
}

export function Breadcrumbs() {
  const [location] = useLocation();

  // Map routes to breadcrumb labels
  const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
    '/': [{ label: 'Home', path: '/' }],
    '/comprehensive-dashboard': [
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/comprehensive-dashboard' },
    ],
    '/qumus-chat': [
      { label: 'Home', path: '/' },
      { label: 'Chat', path: '/qumus-chat' },
    ],
    '/gps-radar': [
      { label: 'Home', path: '/' },
      { label: 'GPS Map', path: '/gps-radar' },
    ],
    '/rockin-boogie': [
      { label: 'Home', path: '/' },
      { label: 'Rockin Boogie', path: '/rockin-boogie' },
    ],
    '/broadcast-hub': [
      { label: 'Home', path: '/' },
      { label: 'Broadcast Hub', path: '/broadcast-hub' },
    ],
    '/mobile-studio': [
      { label: 'Home', path: '/' },
      { label: 'Mobile Studio', path: '/mobile-studio' },
    ],
    '/broadcast-monitoring': [
      { label: 'Home', path: '/' },
      { label: 'RRB Broadcast', path: '/broadcast-monitoring' },
    ],
    '/recommendations': [
      { label: 'Home', path: '/' },
      { label: 'Recommendations', path: '/recommendations' },
    ],
    '/impact-dashboard': [
      { label: 'Home', path: '/' },
      { label: 'Impact', path: '/impact-dashboard' },
    ],
  };

  const breadcrumbs = routeBreadcrumbs[location] || [
    { label: 'Home', path: '/' },
    { label: 'Current Page', path: location },
  ];

  // Don't show breadcrumbs on home page
  if (location === '/') {
    return null;
  }

  return (
    <nav className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground bg-background/50 border-b border-border">
      {breadcrumbs.map((item, index) => (
        <div key={item.path} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
              onClick={() => (window.location.href = item.path)}
            >
              {item.label}
            </Button>
          )}
        </div>
      ))}
    </nav>
  );
}
