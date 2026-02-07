import { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, Download, Share2, Menu, X, Home, BarChart3, MessageSquare, MapPin, Radio, Settings, Music, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { HybridCastTabNavigationFixed } from '@/components/HybridCastTabNavigationFixed';
import { HybridCastStatusWidget } from '@/components/HybridCastStatusWidget';

export function AppHeaderEnhanced() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showHybridCastTabs, setShowHybridCastTabs] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
      toast.success(`Searching for: ${searchQuery}`);
    }
  };

  const handleDownload = () => {
    const pageData = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      title: document.title,
      content: document.body.innerText.substring(0, 5000),
    };
    
    const dataStr = JSON.stringify(pageData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qumus-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Content downloaded successfully');
  };

  const handleShare = () => {
    const shareData = {
      title: 'Qumus - AI Orchestration Platform',
      text: 'Check out this amazing AI orchestration platform!',
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

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Dashboard', icon: BarChart3, path: '/comprehensive-dashboard' },
    { label: 'Chat', icon: MessageSquare, path: '/qumus-chat' },
    { label: 'GPS Map', icon: MapPin, path: '/gps-radar' },
    { label: 'HybridCast', icon: Radio, path: '/gps-radar', action: () => setShowHybridCastTabs(!showHybridCastTabs) },
    { label: 'Rockin Boogie', icon: Music, path: '/rockin-boogie' },
    { label: 'Broadcast Hub', icon: Zap, path: '/broadcast-hub' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">Qumus</div>
            <span className="text-xs font-semibold text-cyan-500 bg-cyan-500/20 px-2 py-1 rounded">HybridCast</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => item.action ? item.action() : navigate(item.path)}
                className={`gap-2 ${item.label === 'HybridCast' && showHybridCastTabs ? 'bg-cyan-500/20 border border-cyan-500' : ''}`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {showSearch ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSearch(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}

            {/* HybridCast Status Widget */}
            <HybridCastStatusWidget />

            {/* Download */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              title="Download page data"
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Share */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              title="Share page"
            >
              <Share2 className="h-4 w-4" />
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border p-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (item.action) item.action();
                  else navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        )}
      </header>

      {/* HybridCast Tab Navigation Panel */}
      {showHybridCastTabs && (
        <div className="border-b border-border bg-slate-900 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                HybridCast Control Center
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHybridCastTabs(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <HybridCastTabNavigationFixed />
          </div>
        </div>
      )}
    </>
  );
}
