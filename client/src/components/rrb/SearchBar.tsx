import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'wouter';

interface SearchResult {
  title: string;
  description: string;
  url: string;
  category: string;
}

const SEARCH_DATA: SearchResult[] = [
  // Music & Audio
  { title: 'Rockin\' Rockin\' Boogie', description: 'Original song co-written with Little Richard', url: '/the-music', category: 'Music' },
  { title: 'Radio Station', description: 'Listen to curated playlist of Seabrun and Helen\'s music', url: '/radio-station', category: 'Music' },
  { title: 'The Music', description: 'Complete discography, interviews, and recordings', url: '/the-music', category: 'Music' },
  
  // Legacy & Biography
  { title: 'The Legacy', description: 'Complete biography and timeline spanning 1971 to 2026', url: '/the-legacy', category: 'Legacy' },
  { title: 'Candy Through the Years', description: 'Visual journey through Seabrun\'s life stages', url: '/candy-through-the-years', category: 'Legacy' },
  { title: 'Grandma Helen', description: 'Helen Logan Hunter - Family foundation and recognition', url: '/grandma-helen', category: 'Legacy' },
  
  // Verification & Proof
  { title: 'Proof Vault', description: 'Verification center with documented evidence and records', url: '/proof-vault', category: 'Verification' },
  { title: 'Testimonials', description: 'Witness statements and first-hand accounts', url: '/testimonials', category: 'Verification' },
  { title: 'Verified Collaborators', description: 'Professional relationships and verified partnerships', url: '/verified-collaborators', category: 'Verification' },
  
  // Resources
  { title: 'Spencer Leigh', description: 'Music historian validation and published confirmation', url: '/spencer-leigh', category: 'Resources' },
  { title: 'Sources & Verification', description: 'Complete list of sources and verification methods', url: '/sources-verification', category: 'Resources' },
  { title: 'Press Kit', description: 'Media-ready materials and press information', url: '/press-kit', category: 'Resources' },
];

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = SEARCH_DATA.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
  }, [query]);

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
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search legacy, music, proof..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="divide-y divide-border">
              {results.map((result, idx) => (
                <Link key={idx} href={result.url}>
                  <div className="p-3 hover:bg-accent/10 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-sm">{result.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{result.description}</p>
                      </div>
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded whitespace-nowrap">
                        {result.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
