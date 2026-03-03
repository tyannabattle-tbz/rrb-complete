import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, Download, Share2, Menu, X, Home, BarChart3, MessageSquare, MapPin, Radio, Settings, Music, Zap, Mic, TrendingUp, Heart, Eye, Truck, Video as VideoIcon, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { HybridCastTabNavigationFixed } from '@/components/HybridCastTabNavigationFixed';
import { HybridCastStatusWidget } from '@/components/HybridCastStatusWidget';
import { SimplifiedMobileNav } from '@/components/SimplifiedMobileNav';
import { SearchBox } from '@/components/SearchBox';

export function AppHeaderEnhanced() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHybridCastTabs, setShowHybridCastTabs] = useState(false);



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
      title: 'QUMUS - Autonomous Orchestration Engine',
      text: 'QUMUS - Autonomous Orchestration by Canryn Production',
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
    { id: 'nav-0', label: 'Home', icon: Home, path: '/', action: () => navigate('/') },
    { id: 'nav-1', label: 'Dashboard', icon: BarChart3, path: '/comprehensive-dashboard', action: () => navigate('/comprehensive-dashboard') },
    { id: 'nav-2', label: 'Chat', icon: MessageSquare, path: '/qumus-chat', action: () => navigate('/qumus-chat') },
    { id: 'nav-3', label: 'GPS Map', icon: MapPin, path: '/gps-radar', action: () => navigate('/gps-radar') },
    { id: 'nav-4', label: 'HybridCast', icon: Radio, path: '/hybridcast', action: () => setShowHybridCastTabs(!showHybridCastTabs) },
    { id: 'nav-5', label: 'RRB Radio', icon: Music, path: '/', action: () => navigate('/') },
    { id: 'nav-6', label: 'Broadcast Hub', icon: Zap, path: '/broadcast-hub', action: () => navigate('/broadcast-hub') },
    { id: 'nav-7', label: 'Mobile Studio', icon: Music, path: '/mobile-studio', action: () => navigate('/mobile-studio') },
    { id: 'nav-8', label: 'Broadcast Monitor', icon: Eye, path: '/broadcast-monitoring', action: () => navigate('/broadcast-monitoring') },
    { id: 'nav-9', label: 'Recommendations', icon: TrendingUp, path: '/recommendations', action: () => navigate('/recommendations') },
    { id: 'nav-10', label: 'Impact', icon: Heart, path: '/impact-dashboard', action: () => navigate('/impact-dashboard') },
  ];

  return (
    <>
      <SimplifiedMobileNav />
      <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span><span className="text-xl font-bold text-primary">QUMUS</span>
            <span className="text-xs font-semibold text-cyan-500 bg-cyan-500/20 px-2 py-1 rounded">HybridCast</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (item.action) item.action();
                  if ((item as any).external) window.open(item.path, '_blank');
                  else if (!item.action) navigate(item.path);
                }}
                className={`gap-2 whitespace-nowrap ${item.label === 'HybridCast' && showHybridCastTabs ? 'bg-cyan-500/20 border border-cyan-500' : ''}`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {/* Search Box */}
            <div className="hidden sm:block w-64">
              <SearchBox category="qumus" />
            </div>

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

            {/* Mobile Menu handled by SimplifiedMobileNav */}
          </div>
        </div>

        {/* Mobile Navigation handled by SimplifiedMobileNav */}
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
