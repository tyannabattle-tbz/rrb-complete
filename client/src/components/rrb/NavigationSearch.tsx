import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcuts } from '@/hooks/rrb_useKeyboardShortcuts';
import { useRecentlyViewed } from '@/hooks/rrb_useRecentlyViewed';

interface SearchItem {
  label: string;
  href: string;
  category?: string;
  keywords?: string[];
}

interface NavigationSearchProps {
  items: SearchItem[];
}

export function NavigationSearch({ items }: NavigationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<SearchItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recentlyViewed = useRecentlyViewed(items);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearchFocus: () => {
      inputRef.current?.focus();
      setIsOpen(true);
    },
    onEscapePress: () => setIsOpen(false),
  });

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.keywords?.some(k => k.toLowerCase().includes(query))
    );
    setFilteredItems(filtered.slice(0, 8)); // Limit to 8 results
  }, [searchQuery, items]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search pages... (Cmd+K)"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full px-3 py-2 pl-10 text-sm border border-border rounded-md bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (filteredItems.length > 0 || recentlyViewed.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="max-h-96 overflow-y-auto">
            {searchQuery === '' && recentlyViewed.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-foreground/50 uppercase tracking-wider bg-background/50 sticky top-0">
                  <Clock className="w-3 h-3 inline mr-2" />
                  Recently Viewed
                </div>
                {recentlyViewed.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent/10 transition-colors text-foreground/70 hover:text-foreground"
                    >
                      {item.label}
                    </button>
                  </Link>
                ))}
                {filteredItems.length > 0 && (
                  <div className="border-t border-border/50" />
                )}
              </>
            )}
            {filteredItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent/10 transition-colors flex items-center justify-between group"
                >
                  <span className="text-foreground">{item.label}</span>
                  {item.category && (
                    <span className="text-xs text-foreground/50 group-hover:text-foreground/70">
                      {item.category}
                    </span>
                  )}
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isOpen && searchQuery && filteredItems.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-lg z-50 p-4 text-center text-sm text-foreground/50">
          No pages found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}
