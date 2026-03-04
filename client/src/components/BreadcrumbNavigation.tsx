import React from 'react';
import { useLocation } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  path: string;
}

export function BreadcrumbNavigation() {
  const [location] = useLocation();

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/' }
    ];

    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location === '/') {
    return null;
  }

  return (
    <nav 
      className="fixed top-16 left-0 right-0 z-[99] bg-background/80 backdrop-blur border-b border-border px-2 md:px-6 py-1 md:py-2"
      aria-label="Breadcrumb"
    >
      <div className="flex items-center gap-0.5 md:gap-1 overflow-x-auto text-xs md:text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-0.5 md:gap-1 whitespace-nowrap">
            {index === 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = crumb.path}
                className="gap-1 text-xs h-7 px-2"
              >
                <Home className="w-3 h-3" />
                <span className="hidden sm:inline">{crumb.label}</span>
              </Button>
            ) : (
              <>
                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-xs text-muted-foreground px-2 py-1">
                    {crumb.label}
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = crumb.path}
                    className="text-xs h-7 px-2"
                  >
                    {crumb.label}
                  </Button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
