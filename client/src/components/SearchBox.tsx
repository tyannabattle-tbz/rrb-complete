import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface SearchBoxProps {
  className?: string;
  onSearch?: (query: string) => void;
  category?: 'all' | 'rrb' | 'qumus';
}

export function SearchBox({ className = '', onSearch, category = 'all' }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions
  const { data: suggestionsData, isLoading: suggestionsLoading } = trpc.search.getSuggestions.useQuery(
    { query },
    { enabled: query.length > 0 }
  );

  // Fetch popular searches
  const { data: popularData } = trpc.search.getPopularSearches.useQuery();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}&category=${category}`);
      setQuery('');
      setIsOpen(false);
      onSearch?.(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const suggestions = suggestionsData?.suggestions || [];
  const popular = popularData?.popular || [];
  const displayItems = query.length > 0 ? suggestions : popular.slice(0, 5);

  return (
    <div ref={containerRef} className={`relative w-full max-w-md ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pink-400" />
        <Input
          type="text"
          placeholder="Search podcasts, channels, topics..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-10 border-pink-500/30 focus:border-pink-500 bg-slate-800/50 text-white placeholder-gray-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <Card className="absolute top-full mt-2 w-full bg-slate-800 border-pink-500/20 z-50 max-h-96 overflow-y-auto">
          {query.length > 0 && suggestionsLoading && (
            <div className="p-4 flex items-center justify-center gap-2 text-pink-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          )}

          {query.length > 0 && !suggestionsLoading && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-400">No results found for "{query}"</div>
          )}

          {/* Suggestions or Popular */}
          {displayItems.length > 0 && (
            <div className="divide-y divide-slate-700">
              {displayItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if ('title' in item) {
                      handleSearch(item.title);
                    } else {
                      handleSearch(item);
                    }
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-pink-600/10 transition-colors flex items-start gap-3"
                >
                  <Search className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">
                      {'title' in item ? item.title : item}
                    </div>
                    {'category' in item && (
                      <div className="text-xs text-pink-300 mt-1">
                        {item.category === 'rrb' ? 'RRB Radio' : 'QUMUS'}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search Button */}
          {query.length > 0 && (
            <div className="p-3 border-t border-slate-700">
              <Button
                onClick={() => handleSearch(query)}
                className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Search for "{query}"
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
