import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, Download, Share2, Menu, X, Home, Radio, Music, Heart, Globe, Zap, Eye, TrendingUp, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SearchBox } from '@/components/SearchBox';

export function RRBHeaderEnhanced() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



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
    link.download = `rrb-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Content downloaded successfully');
  };

  const handleShare = () => {
    const shareData = {
      title: 'Rockin Rockin Boogie - Seabrun Candy Hunter Legacy',
      text: 'Music, Broadcasting & Community by Canryn Production',
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
    { id: 'nav-1', label: 'Radio Station', icon: Radio, path: '/radio-station', action: () => navigate('/radio-station') },
    { id: 'nav-2', label: 'Music Library', icon: Music, path: '/music-library', action: () => navigate('/music-library') },
    { id: 'nav-3', label: 'Podcasts', icon: Mic, path: '/podcasts', action: () => navigate('/podcasts') },
    { id: 'nav-4', label: 'Solbones Game', icon: Zap, path: '/solbones', action: () => navigate('/solbones') },
    { id: 'nav-5', label: 'Donations', icon: Heart, path: '/donations', action: () => navigate('/donations') },
    { id: 'nav-6', label: 'Analytics', icon: TrendingUp, path: '/listener-analytics', action: () => navigate('/listener-analytics') },
    { id: 'nav-7', label: 'Meditation', icon: Globe, path: '/meditation', action: () => navigate('/meditation') },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-pink-500/20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo/Brand with Gold Vinyl */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 shadow-lg flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
                <div className="absolute inset-1 rounded-full border-2 border-yellow-900 opacity-50"></div>
                <Music className="w-5 h-5 text-yellow-200" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                RRB
              </span>
              <span className="text-xs text-pink-300 font-semibold">Legacy</span>
            </div>
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
                }}
                className="gap-2 whitespace-nowrap text-pink-300 hover:text-pink-100 hover:bg-pink-500/10"
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search Box */}
            <div className="hidden sm:block w-64">
              <SearchBox category="rrb" />
            </div>

            {/* Download */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="hidden sm:flex text-pink-300 hover:text-pink-100"
              title="Download page data"
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* Share */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="hidden sm:flex text-pink-300 hover:text-pink-100"
              title="Share this page"
            >
              <Share2 className="w-4 h-4" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-pink-300 hover:text-pink-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-pink-500/20 bg-slate-900/95 backdrop-blur">
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (item.action) item.action();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2 text-pink-300 hover:text-pink-100 hover:bg-pink-500/10"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
