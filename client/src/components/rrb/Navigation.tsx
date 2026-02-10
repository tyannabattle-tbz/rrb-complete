import { useState, useEffect } from 'react';
import { useRecentlyViewed } from '@/hooks/rrb_useRecentlyViewed';
import { Link, useLocation } from 'wouter';
import { Menu, X, Heart, Settings, Search, Sparkles, Download, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DonateModal from './DonateModal';
import { useAuth } from '@/_core/hooks/useAuth';
import { FrequencyToggle } from './FrequencyToggle';
import SocialMediaLinks from './SocialMediaLinks';
import { SearchBar } from './SearchBar';
import { ActiveTabIndicator } from './ActiveTabIndicator';
import { NavigationSearch } from './NavigationSearch';
import { MobileSearchDrawer } from './MobileSearchDrawer';
import { EasterEggSearch } from './EasterEggSearch';
import { usePWA } from '@/hooks/rrb_usePWA';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);
  const [showEmergencyNotice, setShowEmergencyNotice] = useState(false);
  const [isLegacyDropdownOpen, setIsLegacyDropdownOpen] = useState(false);
  const { user } = useAuth();
  const { installPrompt, handleInstall, isInstallable } = usePWA();
  const [location, navigate] = useLocation();
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const handleImOkay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCheckingIn(true);
    try {
      // Send "I'm Okay" status to emergency contacts
      const response = await fetch('/api/trpc/emergency.sendImOkayStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });
      if (response.ok) {
        // Show success toast without navigating
        const event = new CustomEvent('toast', {
          detail: { message: 'Status sent to emergency contacts', type: 'success' }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error sending I\'m Okay status:', error);
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Fix mobile menu scroll - use overflow hidden instead of fixed positioning
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Legacy Restored - Dad's work before passing (Foundation)
  const legacyFoundationItems = [
    { label: 'The Legacy', href: '/rrb/the-legacy' },
    { label: 'The Music', href: '/rrb/the-music' },
    { label: 'Little Richard Connection', href: '/rrb/little-richard-connection' },
    { label: 'Family Achievement', href: '/rrb/family-achievements' },
    { label: 'Grandma Helen', href: '/rrb/grandma-helen' },
    { label: 'Verified Sources', href: '/rrb/verified-sources' },
  ];

  // Legacy Restored - Dad's work before passing
  const legacyRestoredItems = [
    { label: 'Home', href: '/' },
    { label: 'Radio Station', href: '/rrb/radio-station' },
    { label: 'Podcast & Video', href: '/rrb/podcast-and-video' },
    { label: 'HybridCast', href: '/rrb/hybridcast' },
    { label: 'Audiobooks', href: '/rrb/audiobooks' },
    { label: 'Proof Vault', href: '/rrb/proof-vault' },
    { label: 'Obituary', href: '/rrb/obituary' },
    { label: 'Books & Miracles', href: '/rrb/books-and-miracles' },
    { label: 'Published Books', href: '/rrb/books' },
    { label: 'Photo Gallery', href: '/rrb/photo-gallery' },
    { label: 'Systematic Omission', href: '/rrb/systematic-omission' },
    { label: 'Candy Through the Years', href: '/rrb/candy-through-the-years' },
    { label: 'Family Tree', href: '/rrb/family-tree' },
    { label: 'Testimonials & Stories', href: '/rrb/testimonials-and-stories' },
    { label: 'Producer & Mentor', href: '/rrb/producer-mentor' },
    { label: 'Medical Journey', href: '/rrb/medical-journey' },
  ];

  // Legacy Continued - Family's ongoing work
  const legacyContinuedItems = [
    { label: 'Canryn Production Inc', href: '/rrb/canryn-production' },
    { label: 'Family Achievements', href: '/rrb/family-achievements' },
    { label: 'Division Pages', href: '/rrb/divisions' },
    { label: 'Business Partnerships', href: '/rrb/business-partnerships' },
    { label: 'Employee Directory', href: '/rrb/employee-directory' },
    { label: 'Contact Directory', href: '/rrb/contact-directory' },
    { label: 'Merchandise Shop', href: '/rrb/merchandise-shop' },
    { label: 'Sponsorships', href: '/rrb/sponsorships' },
    { label: 'Affiliate Program', href: '/rrb/affiliate-program' },
    { label: 'Video Testimonials', href: '/rrb/video-testimonials' },
    { label: 'News & Updates', href: '/rrb/news' },
  ];

  const additionalItems = [
    { label: 'Healing Music', href: '/rrb/healing-music-frequencies' },
    { label: 'Frequency Guides', href: '/rrb/frequency-guides' },
    { label: 'Meditation Guides', href: '/rrb/meditation-guides' },
    { label: 'Custom Builder', href: '/rrb/custom-meditation-builder' },
    { label: 'Concerts & Tours', href: '/rrb/concerts-tours-performances' },
    { label: 'Tour Schedule', href: '/rrb/tour-schedule' },
    { label: 'Setlist Archive', href: '/rrb/setlist-archive' },
    { label: 'Media Hub', href: '/rrb/media-hub' },
    { label: 'FAQ', href: '/rrb/faq' },
    { label: 'Contact', href: '/rrb/contact-directory' },
  ];

  const isActive = (href) => location === href;

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm hidden md:block">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="font-bold text-lg text-accent hover:text-accent/80 transition-colors">
            RRB
          </a>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1 flex-wrap justify-center flex-1 mx-4">
          <Link href="/">
            <a className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/10'
            }`}>
              Home
            </a>
          </Link>

          {/* Legacy Dropdown */}
          <div className="relative group">
            <button
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                legacyFoundationItems.some(item => isActive(item.href))
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent/10'
              }`}
              onMouseEnter={() => setIsLegacyDropdownOpen(true)}
              onMouseLeave={() => setIsLegacyDropdownOpen(false)}
            >
              Legacy ▼
            </button>
            {isLegacyDropdownOpen && (
              <div
                className="absolute left-0 mt-0 w-48 bg-card border border-border rounded shadow-lg z-50"
                onMouseEnter={() => setIsLegacyDropdownOpen(true)}
                onMouseLeave={() => setIsLegacyDropdownOpen(false)}
              >
                {legacyFoundationItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`block px-4 py-2 text-sm transition-colors first:rounded-t last:rounded-b ${
                        isActive(item.href)
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground hover:bg-accent/10'
                      }`}
                    >
                      {item.label}
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Radio Station */}
          <Link href="/rrb/radio-station">
            <a className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              isActive('/rrb/radio-station')
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/10'
            }`}>
              Radio Station
            </a>
          </Link>

          {/* Podcast & Video */}
          <Link href="/rrb/podcast-and-video">
            <a className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              isActive('/rrb/podcast-and-video')
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/10'
            }`}>
              Podcast & Video
            </a>
          </Link>

          {/* HybridCast */}
          <Link href="/rrb/hybridcast">
            <a className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              isActive('/rrb/hybridcast')
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/10'
            }`}>
              HybridCast
            </a>
          </Link>

          {/* Meditation - Prominent Separate Item */}
          <Link href="/rrb/meditation-guides">
            <a className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              isActive('/rrb/meditation-guides')
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/10'
            }`}>
              🧘 Meditation
            </a>
          </Link>

          {/* Studio */}
          <Link href="/studio">
            <a className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              isActive('/studio')
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/10'
            }`}>
              🎬 Studio
            </a>
          </Link>

          {/* Sweet Miracles - External */}
          <a href="https://sweetmiraclesattt.wixsite.com/sweet-miracles" target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded text-sm font-medium transition-colors text-foreground hover:bg-accent/10">
              ✨ Sweet Miracles
          </a>

          {/* Sweet Miracles Company */}
          <Link href="/rrb/canryn-production">
            <a className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              isActive('/rrb/canryn-production')
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/10'
            }`}>
              💚 Tyanna Battle
            </a>
          </Link>

          {/* Solbones 4+3+2 */}
          <Link href="/solbones">
            <a className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              isActive('/solbones')
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/10'
            }`}>
              ⚡ Solbones 4+3+2
            </a>
          </Link>

          {/* Client Portal */}
          <Link href="/rrb/contact-directory">
            <a className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              isActive('/rrb/contact-directory')
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/10'
            }`}>
              👥 Client Portal
            </a>
          </Link>

          {/* QUMUS Dashboard */}
          <Link href="/qumus-dashboard">
            <a className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              isActive('/qumus-dashboard')
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/10'
            }`}>
              🤖 QUMUS
            </a>
          </Link>

          {/* Human Review */}
          <Link href="/rrb/qumus/human-review">
            <a className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              isActive('/qumus-human-review')
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent/10'
            }`}>
              👤 Review
            </a>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:block p-2 hover:bg-accent/10 rounded transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <FrequencyToggle />
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="p-2 hover:bg-accent/10 rounded transition-colors"
          >
            <Search size={20} />
          </button>
          {/* SOS Button */}
          <button
            onClick={() => navigate('/emergency')}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors flex items-center justify-center w-10 h-10"
            title="Emergency SOS"
            aria-label="Emergency SOS Button"
          >
            <AlertTriangle size={20} />
          </button>
          {/* I'm Okay Button */}
          <button
            onClick={handleImOkay}
            disabled={isCheckingIn}
            className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-full transition-colors flex items-center justify-center w-10 h-10"
            title="I'm Okay Check-in"
            aria-label="I'm Okay Check-in Button"
          >
            <CheckCircle size={20} />
          </button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDonateOpen(true)}
          >
            <Heart size={16} className="mr-1" />
            Support
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="hidden lg:block bg-background border-t border-border max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-4">
            {/* Legacy Foundation Section */}
            <div className="mb-6">
              <h3 className="font-bold text-accent mb-3 text-sm uppercase tracking-wide">
                Legacy Foundation
              </h3>
              <div className="space-y-2">
                {legacyFoundationItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`block px-3 py-2 rounded text-sm transition-colors ${
                        isActive(item.href)
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-foreground hover:bg-accent/10'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                  </Link>
                ))}
              </div>
            </div>

            {/* Legacy Restored Section - Skip Home, Radio, Podcast, HybridCast (already in desktop nav) */}
            <div className="mb-6">
              <h3 className="font-bold text-accent mb-3 text-sm uppercase tracking-wide">
                Legacy Restored
              </h3>
              <div className="space-y-2">
                {legacyRestoredItems.slice(4).map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`block px-3 py-2 rounded text-sm transition-colors ${
                        isActive(item.href)
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-foreground hover:bg-accent/10'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                  </Link>
                ))}
              </div>
            </div>

            {/* Legacy Continued Section */}
            <div className="mb-6">
              <h3 className="font-bold text-accent mb-3 text-sm uppercase tracking-wide">
                Legacy Continued
              </h3>
              <div className="space-y-2">
                {legacyContinuedItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`block px-3 py-2 rounded text-sm transition-colors ${
                        isActive(item.href)
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-foreground hover:bg-accent/10'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                  </Link>
                ))}
              </div>
            </div>

            {/* Meditation - Mobile */}
            <div className="mb-6">
              <Link href="/rrb/meditation-guides">
                <a
                  className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isActive('/rrb/meditation-guides')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-accent/10'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  🧘 Meditation
                </a>
              </Link>
            </div>

            {/* Additional Items */}
            <div>
              <h3 className="font-bold text-accent mb-3 text-sm uppercase tracking-wide">
                More
              </h3>
              <div className="space-y-2">
                {additionalItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`block px-3 py-2 rounded text-sm transition-colors ${
                        isActive(item.href)
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-foreground hover:bg-accent/10'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="mt-6 pt-4 border-t border-border space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsMobileSearchOpen(true);
                  setIsOpen(false);
                }}
              >
                <Search size={16} className="mr-2" />
                Search
              </Button>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    navigate('/emergency');
                    setIsOpen(false);
                  }}
                >
                  <AlertTriangle size={16} className="mr-2" />
                  SOS
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white"
                  disabled={isCheckingIn}
                  onClick={(e) => {
                    handleImOkay(e);
                    setIsOpen(false);
                  }}
                >
                  <CheckCircle size={16} className="mr-2" />
                  {isCheckingIn ? 'Sending...' : "I'm Okay"}
                </Button>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setIsDonateOpen(true);
                  setIsOpen(false);
                }}
              >
                <Heart size={16} className="mr-2" />
                Support the Legacy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isDonateOpen && <DonateModal onClose={() => setIsDonateOpen(false)} />}
      {isMobileSearchOpen && (
        <MobileSearchDrawer onClose={() => setIsMobileSearchOpen(false)} />
      )}
    </nav>
  );
}
