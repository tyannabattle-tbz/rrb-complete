import { useState, useEffect } from 'react';
import { Search, X, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Tab {
  id: string;
  label: string;
  category: string;
  description: string;
}

interface HybridCastSearchFilterProps {
  tabs: Tab[];
  onTabSelect: (tabId: string) => void;
  onClose?: () => void;
}

export function HybridCastSearchFilter({ tabs, onTabSelect, onClose }: HybridCastSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTabs, setFilteredTabs] = useState<Tab[]>(tabs);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Filter tabs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTabs(tabs);
      setShowResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = tabs.filter(
      (tab) =>
        tab.label.toLowerCase().includes(query) ||
        tab.description.toLowerCase().includes(query) ||
        tab.category.toLowerCase().includes(query)
    );

    setFilteredTabs(filtered);
    setSelectedIndex(0);
    setShowResults(true);
  }, [searchQuery, tabs]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showResults) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredTabs.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredTabs.length) % filteredTabs.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredTabs[selectedIndex]) {
            onTabSelect(filteredTabs[selectedIndex].id);
            setSearchQuery('');
            setShowResults(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSearchQuery('');
          setShowResults(false);
          onClose?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResults, filteredTabs, selectedIndex, onTabSelect, onClose]);

  // Global keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('hybridcast-search-input') as HTMLInputElement;
        input?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      network: 'text-cyan-400 bg-cyan-500/10',
      communication: 'text-blue-400 bg-blue-500/10',
      emergency: 'text-red-400 bg-red-500/10',
      health: 'text-green-400 bg-green-500/10',
      security: 'text-purple-400 bg-purple-500/10',
      accessibility: 'text-yellow-400 bg-yellow-500/10',
      operations: 'text-slate-400 bg-slate-500/10',
    };
    return colors[category] || 'text-slate-400 bg-slate-500/10';
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <Input
          id="hybridcast-search-input"
          type="text"
          placeholder="Search tabs... (Ctrl+K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          className="pl-10 pr-10 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Keyboard Hint */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-2">
        <span>
          {filteredTabs.length} result{filteredTabs.length !== 1 ? 's' : ''}
        </span>
        <div className="flex gap-2">
          <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs">
            <Command className="w-3 h-3 inline mr-1" />K
          </kbd>
          <span>to search</span>
        </div>
      </div>

      {/* Search Results */}
      {showResults && filteredTabs.length > 0 && (
        <Card className="p-2 bg-slate-900 border border-slate-700 max-h-96 overflow-y-auto">
          <div className="space-y-1">
            {filteredTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabSelect(tab.id);
                  setSearchQuery('');
                  setShowResults(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  index === selectedIndex
                    ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{tab.label}</div>
                    <div className="text-xs text-slate-500 truncate">{tab.description}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${getCategoryColor(tab.category)}`}>
                    {tab.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* No Results */}
      {showResults && filteredTabs.length === 0 && searchQuery && (
        <Card className="p-4 bg-slate-900 border border-slate-700 text-center">
          <p className="text-slate-400 text-sm">No tabs found matching "{searchQuery}"</p>
        </Card>
      )}

      {/* Keyboard Navigation Hints */}
      {showResults && filteredTabs.length > 0 && (
        <div className="flex gap-2 text-xs text-slate-500 px-2 flex-wrap">
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded">↑↓</kbd>
            <span>navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded">Enter</kbd>
            <span>select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded">Esc</kbd>
            <span>close</span>
          </div>
        </div>
      )}
    </div>
  );
}
