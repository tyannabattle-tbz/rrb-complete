import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function MobileHeader() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
      toast.success(`Searching for: ${searchQuery}`);
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Main Header Bar */}
      <div className="flex h-14 items-center justify-between px-4 gap-2">
        {/* Logo */}
        <div className="text-xl font-bold text-primary flex-shrink-0">Qumus</div>

        {/* Search Bar (centered, takes available space) */}
        {showSearch ? (
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-1">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-sm flex-1"
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(false)}
              className="h-9 w-9 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(true)}
            className="h-9 w-9 p-0 flex-shrink-0"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}

        {/* Menu Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="h-9 w-9 p-0 flex-shrink-0"
          title={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Status Bar (HybridCast status only) */}
      <div className="px-4 py-2 border-t border-border/50 bg-background/50 text-xs flex items-center gap-2">
        <span className="text-muted-foreground">HybridCast:</span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-foreground font-medium">Online</span>
        </span>
      </div>

      {/* Overlay for menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}
