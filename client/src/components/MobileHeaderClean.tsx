import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileHeaderClean() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="text-2xl font-bold text-primary">Qumus</div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="h-10 w-10 p-0"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
    </header>
  );
}
