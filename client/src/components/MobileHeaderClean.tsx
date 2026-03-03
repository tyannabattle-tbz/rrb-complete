import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileHeaderClean() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  // Close menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('mobileMenuToggle', { detail: { open: !mobileMenuOpen } }));
  };

  return (
    <header className="md:hidden sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2"><img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/rrb-logo-192-dzAibatRvMdcku6TfWGqEe.webp" alt="RRB" className="w-8 h-8 rounded" /><span className="text-xl font-bold text-primary">RRB</span></div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMenu}
          className="h-10 w-10 p-0"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
    </header>
  );
}
