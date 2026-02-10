import { useState, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { Link } from 'wouter';
import { useRecentlyViewed } from '@/hooks/rrb_useRecentlyViewed';

interface SearchItem {
  label: string;
  href: string;
  category?: string;
}

interface MobileSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items?: SearchItem[];
}

const DEFAULT_SEARCH_ITEMS: SearchItem[] = [
  { label: 'Home', href: '/', category: 'Navigation' },
  { label: 'The Legacy', href: '/the-legacy', category: 'Content' },
  { label: 'The Music', href: '/the-music', category: 'Content' },
  { label: 'Proof Vault', href: '/proof-vault', category: 'Content' },
  { label: 'Medical Journey', href: '/medical-journey', category: 'Content' },
  { label: 'Testimonials & Stories', href: '/testimonials-and-stories', category: 'Content' },
  { label: 'Historical Timeline', href: '/historical-timeline', category: 'Content' },
  { label: 'Audio Archive', href: '/audio-archive', category: 'Content' },
  { label: 'Books & Resources', href: '/rrb/books', category: 'Content' },
  { label: 'Concert Venues & Performances', href: '/concert-venues', category: 'Content' },
  { label: 'Analytics Dashboard', href: '/analytics-consolidated', category: 'Content' },
  { label: 'Contact', href: '/contact', category: 'Navigation' },
];

export function MobileSearchDrawer({ isOpen, onClose, items = DEFAULT_SEARCH_ITEMS }: MobileSearchDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<SearchItem[]>([]);
  const searchItems = items || DEFAULT_SEARCH_ITEMS;
  const recentlyViewed = useRecentlyViewed(searchItems);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = searchItems.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );
    setFilteredItems(filtered.slice(0, 10));
  }, [searchQuery, searchItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-x-0 top-0 bg-background rounded-b-lg shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Search</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <input
              type="text"
              placeholder="Search pages..."
              onTouchStart={(e) => e.currentTarget.focus()}
              value={searchQuery}
              onChange={(e) => {
                e.preventDefault();
                setSearchQuery(e.target.value);
              }}
              autoFocus
              inputMode="text"
              className="w-full px-4 py-3 pl-10 text-base border border-border rounded-lg bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent text-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/50 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setSearchQuery('');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Recently Viewed */}
          {searchQuery === '' && recentlyViewed.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground/60 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                Recently Viewed
              </div>
              <div className="space-y-2">
                {recentlyViewed.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        setSearchQuery('');
                      }}
                      className="w-full px-4 py-3 text-left rounded-lg hover:bg-accent/10 transition-colors text-foreground/80 hover:text-foreground"
                    >
                      {item.label}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div>
              {filteredItems.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-3">
                    Results
                  </div>
                  {filteredItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onClose();
                          setSearchQuery('');
                        }}
                        className="w-full px-4 py-3 text-left rounded-lg hover:bg-accent/10 transition-colors flex items-center justify-between"
                      >
                        <span className="text-foreground font-medium">{item.label}</span>
                        {item.category && (
                          <span className="text-xs text-foreground/50">{item.category}</span>
                        )}
                      </button>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-foreground/50">
                  No pages found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {searchQuery === '' && recentlyViewed.length === 0 && (
            <div className="text-center py-8 text-foreground/50">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Start typing to search pages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
