import React, { ReactNode } from 'react';
// MobileBottomNav is now rendered in App.tsx

interface MobileResponsiveLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function MobileResponsiveLayout({
  children,
  showBottomNav = true,
}: MobileResponsiveLayoutProps) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Main content area */}
      <main className="flex-1 w-full overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
