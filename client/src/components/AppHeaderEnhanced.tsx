import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Search, Share2, Menu, X, Home, Radio, Music, Heart, BookOpen, Shield, Headphones, ChevronDown, ExternalLink, Podcast, Building2, Zap, Settings, Dice5, Film, Video, Smartphone, Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SimplifiedMobileNav } from '@/components/SimplifiedMobileNav';
import { useAuth } from '@/_core/hooks/useAuth';

interface DropdownItem {
  label: string;
  path: string;
  external?: boolean;
}

interface NavDropdown {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: DropdownItem[];
}

function NavDropdownMenu({ dropdown, isOpen, onToggle, onNavigate }: {
  dropdown: NavDropdown;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: (path: string, external?: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (isOpen) onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={`gap-1.5 ${isOpen ? 'bg-accent text-accent-foreground' : ''}`}
      >
        <dropdown.icon className="h-4 w-4" />
        <span className="hidden lg:inline">{dropdown.label}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg py-1 z-50">
          {dropdown.items.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                onNavigate(item.path, item.external);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between"
            >
              {item.label}
              {item.external && <ExternalLink className="h-3 w-3 opacity-50" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppHeaderEnhanced() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
      toast.success(`Searching for: ${searchQuery}`);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: 'Rockin Rockin Boogie — Legacy Restored',
      text: 'Check out Rockin Rockin Boogie — the legacy of Seabrun Candy Hunter!',
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleNavigate = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(path);
    }
  };

  // Public-facing navigation organized by Legacy Restored / Legacy Continued
  const dropdowns: NavDropdown[] = [
    {
      id: 'legacy',
      label: 'The Legacy',
      icon: BookOpen,
      items: [
        { label: 'The Legacy Story', path: '/rrb/the-legacy' },
        { label: 'Grandma Helen', path: '/rrb/grandma-helen' },
        { label: 'Proof Vault', path: '/rrb/proof-vault' },
        { label: 'Systematic Omission', path: '/rrb/systematic-omission' },
        { label: 'Little Richard Connection', path: '/rrb/little-richard-connection' },
        { label: 'Family Tree', path: '/rrb/family-tree' },
        { label: 'Obituary & Memorial', path: '/rrb/obituary' },
        { label: 'Verified Sources', path: '/rrb/verified-sources' },
      ],
    },
    {
      id: 'music',
      label: 'Music & Radio',
      icon: Music,
      items: [
        { label: 'The Music', path: '/rrb/the-music' },
        { label: 'Radio Station', path: '/rrb/radio-station' },
        { label: 'Podcast & Video', path: '/rrb/podcast-and-video' },
        { label: 'AI Assistants', path: '/rrb/ai-assistants' },
        { label: 'Healing Frequencies', path: '/rrb/healing-music-frequencies' },
        { label: 'Audiobooks', path: '/rrb/audiobooks' },
        { label: 'Candy Through the Years', path: '/rrb/candy-through-the-years' },
        { label: 'Setlist Archive', path: '/rrb/setlist-archive' },
        { label: 'RSS Feeds', path: '/rss' },
      ],
    },
    {
      id: 'listen',
      label: 'Listen Live',
      icon: Radio,
      items: [
        { label: 'RRB Radio Station', path: '/rrb/radio-station' },
        { label: 'Meditation Guides', path: '/rrb/meditation-guides' },
        { label: 'Frequency Guides', path: '/rrb/frequency-guides' },
        { label: 'Custom Meditation', path: '/rrb/custom-meditation-builder' },
      ],
    },
    {
      id: 'community',
      label: 'Community',
      icon: Heart,
      items: [
        { label: 'Sweet Miracles', path: 'https://sweetmiraclesattt.wixsite.com/sweet-miracles', external: true },
        { label: 'Books & Miracles', path: '/rrb/books-and-miracles' },
        { label: 'Published Books (B&N)', path: '/rrb/books' },
        { label: 'Photo Gallery', path: '/rrb/photo-gallery' },
        { label: 'Testimonials & Stories', path: '/rrb/testimonials-and-stories' },
        { label: 'Video Testimonials', path: '/rrb/video-testimonials' },
        { label: 'Family Achievements', path: '/rrb/family-achievements' },
        { label: 'News & Updates', path: '/rrb/news' },
        { label: 'FAQ', path: '/rrb/faq' },
      ],
    },
    {
      id: 'studio',
      label: 'Studio',
      icon: Film,
      items: [
        { label: 'Production Studio', path: '/studio' },
        { label: 'Video Processing', path: '/video-processing' },
        { label: 'Motion Studio', path: '/motion-studio' },
        { label: 'Mobile Studio', path: '/mobile-studio' },
        { label: 'Video Production', path: '/video-production' },
        { label: 'Audio Editor', path: '/audio-editor' },
        { label: 'Media Hub', path: '/rrb/media-hub' },
      ],
    },
    {
      id: 'canryn',
      label: 'Canryn',
      icon: Building2,
      items: [
        { label: 'Canryn Production', path: '/rrb/canryn-production' },
        { label: 'Divisions', path: '/rrb/divisions' },
        { label: 'HybridCast Emergency', path: '/hybridcast' },
        { label: 'Producer & Mentor', path: '/rrb/producer-mentor' },
        { label: 'Business Partnerships', path: '/rrb/business-partnerships' },
        { label: 'Merchandise', path: '/rrb/merchandise-shop' },
        { label: 'Sponsorships', path: '/rrb/sponsorships' },
      ],
    },
  ];

  return (
    <>
      <SimplifiedMobileNav />
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity">
            <div className="text-2xl font-bold text-primary">RRB</div>
            <span className="text-xs font-semibold text-amber-500 bg-amber-500/20 px-2 py-1 rounded">LIVE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className={`gap-1.5 ${location === '/' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <Home className="h-4 w-4" />
              <span className="hidden lg:inline">Home</span>
            </Button>

            {dropdowns.map((dropdown) => (
              <NavDropdownMenu
                key={dropdown.id}
                dropdown={dropdown}
                isOpen={openDropdown === dropdown.id}
                onToggle={() => setOpenDropdown(openDropdown === dropdown.id ? null : dropdown.id)}
                onNavigate={handleNavigate}
              />
            ))}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {showSearch ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 md:w-48 text-sm"
                  autoFocus
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowSearch(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)}>
                <Search className="h-4 w-4" />
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={handleShare} title="Share page">
              <Share2 className="h-4 w-4" />
            </Button>

            {/* Solbones 4+3+2 Dice - visible to all */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/solbones')}
              title="Solbones 4+3+2 Dice Game"
              className="gap-1.5"
            >
              <Dice5 className="h-4 w-4" />
              <span className="hidden lg:inline text-xs">Solbones 4+3+2</span>
            </Button>

            {/* Admin-only QUMUS link */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/qumus')}
                title="QUMUS Admin Dashboard"
                className="gap-1.5 text-cyan-500 hover:text-cyan-400"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden lg:inline text-xs">Admin</span>
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
