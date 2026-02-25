import React, { ReactNode } from 'react';
import { MobileBottomNav } from './MobileBottomNav';

interface MobileResponsiveLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function MobileResponsiveLayout({
  children,
  showBottomNav = true,
}: MobileResponsiveLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Main content area - with proper padding for mobile */}
      <main className="flex-1 w-full overflow-x-hidden pb-24 md:pb-0 pt-0 md:pt-4">
        {children}
      </main>

      {/* Mobile bottom navigation - shown only on mobile */}
      {showBottomNav && <div className="md:hidden"><MobileBottomNav /></div>}
    </div>
  );
}
