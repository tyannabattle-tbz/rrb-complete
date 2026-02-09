import { useState, useEffect } from 'react';
import { Search, Sparkles, Lock, Unlock, Volume2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  searchEasterEggs,
  getEasterEggStats,
  generateHint,
  type EasterEgg,
} from '@/lib/easterEggEncryption';

interface EasterEggSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EasterEggSearch({ isOpen, onClose }: EasterEggSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EasterEgg[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hint, setHint] = useState('');
  const [stats, setStats] = useState({ total: 0, common: 0, rare: 0, legendary: 0 });

  useEffect(() => {
    setStats(getEasterEggStats());
    setHint(generateHint());
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const foundEggs = searchEasterEggs(query);
      setResults(foundEggs);
    } else {
      setResults([]);
    }
  }, [query]);

  const rarityColors = {
    common: 'bg-gray-100 text-gray-800',
    rare: 'bg-blue-100 text-blue-800',
    legendary: 'bg-yellow-100 text-yellow-800',
  };

  const rarityEmojis = {
    common: '🔵',
    rare: '🔷',
    legendary: '⭐',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Hidden Treasures</h2>
            </div>
            <button
              onClick={onClose}
              className="text-accent-foreground/70 hover:text-accent-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-accent-foreground/90 text-sm">
            Discover hidden easter eggs by searching for key terms related to the legacy.
          </p>
        </div>

        {/* Search Box */}
        <div className="p-6 border-b border-border">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for easter eggs... (try: 'rockin boogie', 'alvin taylor', 'legacy')"
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
          </div>

          {/* Hint */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
            <strong>💡 Hint:</strong> {hint}
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 bg-muted/50 border-b border-border">
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <p className="font-bold text-lg text-foreground">{stats.total}</p>
              <p className="text-foreground/70">Total Eggs</p>
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{stats.common}</p>
              <p className="text-foreground/70">Common</p>
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{stats.rare}</p>
              <p className="text-foreground/70">Rare</p>
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{stats.legendary}</p>
              <p className="text-foreground/70">Legendary</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {query.length === 0 ? (
            <div className="text-center py-12 text-foreground/50">
              <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start typing to unlock hidden treasures...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-foreground/50">
              <p>No easter eggs found for "{query}"</p>
              <p className="text-sm mt-2">Try different search terms!</p>
            </div>
          ) : (
            results.map((egg) => (
              <Card
                key={egg.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setExpandedId(expandedId === egg.id ? null : egg.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{rarityEmojis[egg.rarity]}</span>
                      <h3 className="font-bold text-foreground">{egg.title}</h3>
                      <Badge className={rarityColors[egg.rarity]}>
                        {egg.rarity.charAt(0).toUpperCase() + egg.rarity.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/70">{egg.content}</p>
                  </div>
                  <Unlock className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                </div>

                {expandedId === egg.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <div className="bg-accent/10 rounded p-3">
                      <p className="text-xs text-foreground/60 mb-1">
                        <strong>Trigger:</strong> "{egg.trigger}"
                      </p>
                      <p className="text-xs text-foreground/60">
                        <strong>Type:</strong> {egg.type}
                      </p>
                    </div>
                    {egg.type === 'audio' && (
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded transition-colors">
                        <Volume2 className="w-4 h-4" />
                        Play Audio
                      </button>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-muted/50 text-center text-xs text-foreground/60">
          <p>🔐 Easter eggs are encrypted and verified as part of the legacy archive</p>
        </div>
      </Card>
    </div>
  );
}
