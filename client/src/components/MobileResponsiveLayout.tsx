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
      {/* Main content area */}
      <main className="flex-1 w-full overflow-x-hidden pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
}
