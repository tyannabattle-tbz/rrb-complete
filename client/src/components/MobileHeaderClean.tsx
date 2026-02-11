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

  // Listen for sidebar close events from child components
  useEffect(() => {
    const handleSidebarClose = () => {
      setMobileMenuOpen(false);
    };
    window.addEventListener('closeMobileMenu', handleSidebarClose);
    return () => window.removeEventListener('closeMobileMenu', handleSidebarClose);
  }, []);

  const toggleMenu = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('mobileMenuToggle', { detail: { open: newState } }));
  };

  return (
    <header className="md:hidden sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="text-2xl font-bold text-primary">RRB</div>
        
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
