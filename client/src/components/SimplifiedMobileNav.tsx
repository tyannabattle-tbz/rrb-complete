import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Menu, X, Home, BookOpen, Music, Radio, Heart, Building2, ExternalLink, Headphones, Shield, Podcast, Film, Video, Smartphone, Dice5, Globe, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  external?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function SimplifiedMobileNav() {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navSections: NavSection[] = [
    {
      title: 'Navigate',
      items: [
        { id: 'nav-home', label: 'Home', icon: Home, path: '/' },
        { id: 'nav-radio', label: 'Radio Station', icon: Radio, path: '/rrb/radio-station' },
        { id: 'nav-music', label: 'The Music', icon: Music, path: '/rrb/the-music' },
        { id: 'nav-solbones', label: '⚡ Solbones 4+3+2', icon: Dice5, path: '/solbones' },
        { id: 'nav-solbones-online', label: 'Online Multiplayer', icon: Globe, path: '/solbones-online' },
        { id: 'nav-solbones-tournament', label: 'Tournament Brackets', icon: Trophy, path: '/solbones-tournament' },
      ],
    },
    {
      title: 'Legacy Restored',
      items: [
        { id: 'nav-legacy', label: 'The Legacy', icon: BookOpen, path: '/rrb/the-legacy' },
        { id: 'nav-grandma', label: 'Grandma Helen', icon: Heart, path: '/rrb/grandma-helen' },
        { id: 'nav-proof', label: 'Proof Vault', icon: Shield, path: '/rrb/proof-vault' },
        { id: 'nav-omission', label: 'Systematic Omission', icon: BookOpen, path: '/rrb/systematic-omission' },
        { id: 'nav-lr', label: 'Little Richard Connection', icon: Music, path: '/rrb/little-richard-connection' },
        { id: 'nav-family', label: 'Family Tree', icon: Heart, path: '/rrb/family-tree' },
        { id: 'nav-obituary', label: 'Obituary & Memorial', icon: Heart, path: '/rrb/obituary' },
        { id: 'nav-candy', label: 'Candy Through the Years', icon: BookOpen, path: '/rrb/candy-through-the-years' },
        { id: 'nav-sources', label: 'Verified Sources', icon: Shield, path: '/rrb/verified-sources' },
      ],
    },
    {
      title: 'Listen & Watch',
      items: [
        { id: 'nav-freq', label: 'Healing Frequencies', icon: Headphones, path: '/rrb/healing-music-frequencies' },
        { id: 'nav-meditation', label: 'Meditation Guides', icon: Headphones, path: '/rrb/meditation-guides' },
        { id: 'nav-podcast', label: 'Podcast & Video', icon: Podcast, path: '/rrb/podcast-and-video' },
        { id: 'nav-audiobooks', label: 'Audiobooks', icon: Headphones, path: '/rrb/audiobooks' },
        { id: 'nav-setlist', label: 'Setlist Archive', icon: Music, path: '/rrb/setlist-archive' },
      ],
    },
    {
      title: 'Community',
      items: [
        { id: 'nav-sweet', label: 'Sweet Miracles', icon: Heart, path: 'https://sweetmiraclesattt.wixsite.com/sweet-miracles', external: true },
        { id: 'nav-books', label: 'Books & Miracles', icon: BookOpen, path: '/rrb/books-and-miracles' },
        { id: 'nav-testimonials', label: 'Testimonials', icon: Heart, path: '/rrb/testimonials-and-stories' },
        { id: 'nav-news', label: 'News & Updates', icon: BookOpen, path: '/rrb/news' },
        { id: 'nav-faq', label: 'FAQ', icon: BookOpen, path: '/rrb/faq' },
      ],
    },
    {
      title: 'Studio',
      items: [
        { id: 'nav-studio', label: 'Production Studio', icon: Film, path: '/studio' },
        { id: 'nav-video-proc', label: 'Video Processing', icon: Video, path: '/video-processing' },
        { id: 'nav-motion', label: 'Motion Studio', icon: Film, path: '/motion-studio' },
        { id: 'nav-mobile-studio', label: 'Mobile Studio', icon: Smartphone, path: '/mobile-studio' },
        { id: 'nav-media-hub', label: 'Media Hub', icon: Film, path: '/rrb/media-hub' },
      ],
    },
    {
      title: 'Canryn Production',
      items: [
        { id: 'nav-canryn', label: 'Canryn Production', icon: Building2, path: '/rrb/canryn-production' },
        { id: 'nav-divisions', label: 'Divisions', icon: Building2, path: '/rrb/divisions' },
        { id: 'nav-hybridcast', label: 'HybridCast', icon: Radio, path: '/hybridcast' },
        { id: 'nav-merch', label: 'Merchandise', icon: Building2, path: '/rrb/merchandise-shop' },
      ],
    },
  ];

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '?');
  };

  const handleNavigation = (item: NavItem) => {
    if (item.external) {
      window.open(item.path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.path);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50"
        title={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <nav className="fixed top-16 right-0 bottom-0 w-72 bg-background border-l border-border z-40 md:hidden overflow-y-auto">
          <div className="p-4 space-y-5">
            {navSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = !item.external && isActive(item.path);

                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNavigation(item)}
                        className={`w-full justify-start gap-3 h-9 ${
                          active
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate text-sm">{item.label}</span>
                        {item.external && <ExternalLink className="h-3 w-3 ml-auto opacity-50 flex-shrink-0" />}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
