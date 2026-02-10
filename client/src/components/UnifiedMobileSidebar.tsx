import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { 
  ChevronDown, ChevronRight, Home, Radio, Headphones, Tv, 
  Music, BookOpen, Heart, Shield, BarChart3, Settings, 
  MessageSquare, Video, Palette, Layers, Monitor, Users,
  AlertTriangle, CheckCircle, Search, Sparkles, Bot,
  Globe, Building2, Award, FileText, Map, Clock, Film, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { label: string; href: string; icon?: React.ComponentType<{ className?: string }>; external?: boolean }[];
  defaultOpen?: boolean;
}

export function UnifiedMobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [location, navigate] = useLocation();

  // Listen for mobile menu toggle events from MobileHeaderClean
  useEffect(() => {
    const handleMenuToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsOpen(customEvent.detail.open);
    };
    window.addEventListener('mobileMenuToggle', handleMenuToggle);
    return () => window.removeEventListener('mobileMenuToggle', handleMenuToggle);
  }, []);

  // Close sidebar when location changes
  useEffect(() => {
    setIsOpen(false);
    window.dispatchEvent(new Event('closeMobileMenu'));
  }, [location]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleNavClick = (href: string, external?: boolean) => {
    if (external || href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      navigate(href);
    }
    setIsOpen(false);
    window.dispatchEvent(new Event('closeMobileMenu'));
  };

  const isActive = (href: string) => location === href;

  const menuSections: MenuSection[] = [
    {
      title: 'Qumus AI',
      icon: Bot,
      defaultOpen: true,
      items: [
        { label: 'AI Chat', href: '/qumus-chat', icon: MessageSquare },
        { label: 'Video Generation', href: '/video-processing', icon: Video },
        { label: 'Watermarking', href: '/watermark-editor', icon: Palette },
        { label: 'Batch Processing', href: '/batch', icon: Layers },
        { label: 'Analytics', href: '/analytics', icon: BarChart3 },
        { label: 'Monitoring', href: '/qumus-monitoring', icon: Monitor },
        { label: 'Dashboard', href: '/comprehensive-dashboard', icon: BarChart3 },
      ],
    },
    {
      title: 'RRB Entertainment',
      icon: Music,
      items: [
        { label: 'RRB Home', href: '/rrb', icon: Home },
        { label: 'Radio Station', href: '/rrb/radio-station', icon: Radio },
        { label: 'Podcast & Video', href: '/rrb/podcast-and-video', icon: Headphones },
        { label: 'The Music', href: '/rrb/the-music', icon: Music },
        { label: 'Meditation', href: '/rrb/meditation-guides', icon: Sparkles },
      ],
    },
    {
      title: 'Legacy Foundation',
      icon: Award,
      items: [
        { label: 'The Legacy', href: '/rrb/the-legacy', icon: BookOpen },
        { label: 'Little Richard Connection', href: '/rrb/little-richard-connection', icon: Music },
        { label: 'Family Achievements', href: '/rrb/family-achievements', icon: Award },
        { label: 'Grandma Helen', href: '/rrb/grandma-helen', icon: Heart },
        { label: 'Verified Sources', href: '/rrb/verified-sources', icon: FileText },
      ],
    },
    {
      title: 'Legacy Restored',
      icon: BookOpen,
      items: [
        { label: 'HybridCast', href: '/rrb/hybridcast', icon: Tv },
        { label: 'Audiobooks', href: '/rrb/audiobooks', icon: Headphones },
        { label: 'Proof Vault', href: '/rrb/proof-vault', icon: Shield },
        { label: 'Books & Miracles', href: '/rrb/books-and-miracles', icon: BookOpen },
        { label: 'Published Books', href: '/rrb/books', icon: BookOpen },
        { label: 'Family Tree', href: '/rrb/family-tree', icon: Users },
        { label: 'Testimonials', href: '/rrb/testimonials-and-stories', icon: MessageSquare },
        { label: 'Producer & Mentor', href: '/rrb/producer-mentor', icon: Award },
      ],
    },
    {
      title: 'Studio — The Bridge',
      icon: Film,
      items: [
        { label: 'Production Studio', href: '/studio', icon: Film },
        { label: 'Video Processing', href: '/video-processing', icon: Video },
        { label: 'Motion Studio', href: '/motion-studio', icon: Film },
        { label: 'Mobile Studio', href: '/mobile-studio', icon: Smartphone },
        { label: 'Video Production', href: '/video-production', icon: Video },
        { label: 'Audio Editor', href: '/audio-editor', icon: Headphones },
        { label: 'Media Hub', href: '/rrb/media-hub', icon: Film },
      ],
    },
    {
      title: 'Legacy Continued',
      icon: Building2,
      items: [
        { label: 'Canryn Production', href: '/rrb/canryn-production', icon: Building2 },
        { label: 'Divisions', href: '/rrb/divisions', icon: Layers },
        { label: 'Business Partnerships', href: '/rrb/business-partnerships', icon: Users },
        { label: 'Merchandise Shop', href: '/rrb/merchandise-shop', icon: Heart },
        { label: 'News & Updates', href: '/rrb/news', icon: FileText },
        { label: 'Contact', href: '/rrb/contact', icon: MessageSquare },
      ],
    },
    {
      title: 'Sweet Miracles',
      icon: Heart,
      items: [
        { label: 'Sweet Miracles', href: 'https://sweetmiraclesattt.wixsite.com/sweet-miracles', icon: Heart, external: true },
        { label: 'Impact Dashboard', href: '/impact-dashboard', icon: BarChart3 },
        { label: 'Donate', href: '/donate', icon: Heart },
      ],
    },
    {
      title: 'Broadcast Control',
      icon: Radio,
      items: [
        { label: 'Broadcast Hub', href: '/broadcast-hub', icon: Radio },
        { label: 'Broadcast Control', href: '/rrb/broadcast/control', icon: Settings },
        { label: 'Broadcast Admin', href: '/rrb/broadcast/admin', icon: Shield },
        { label: 'Broadcast Monitoring', href: '/broadcast-monitoring', icon: Monitor },
        { label: 'Broadcast Scheduler', href: '/broadcast-scheduler', icon: Settings },
        { label: 'Content Scheduler', href: '/content-scheduler', icon: Clock },
        { label: 'Listener Analytics', href: '/listener-analytics', icon: BarChart3 },
        { label: 'Emergency Alerts', href: '/emergency-alerts', icon: AlertTriangle },
      ],
    },
    {
      title: 'Administration',
      icon: Settings,
      items: [
        { label: 'Admin Dashboard', href: '/admin', icon: Settings },
        { label: 'Ecosystem Dashboard', href: '/rrb/ecosystem/dashboard', icon: Globe },
        { label: 'QUMUS Admin', href: '/rrb/qumus/admin', icon: Bot },
        { label: 'Human Review', href: '/rrb/qumus/human-review', icon: Users },
        { label: 'Policy Analytics', href: '/rrb/qumus/analytics', icon: BarChart3 },
        { label: 'Audit Trail', href: '/audit-trail', icon: FileText },
        { label: 'Service Health', href: '/service-health', icon: Monitor },
        { label: 'Canryn HQ', href: '/canryn', icon: Building2 },
      ],
    },
  ];

  // Initialize default open sections
  useEffect(() => {
    const defaults: Record<string, boolean> = {};
    menuSections.forEach(section => {
      if (section.defaultOpen) defaults[section.title] = true;
    });
    setExpandedSections(prev => ({ ...defaults, ...prev }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[45] top-16 bottom-16">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          setIsOpen(false);
          window.dispatchEvent(new Event('closeMobileMenu'));
        }}
      />
      
      {/* Sidebar */}
      <div className="absolute top-0 left-0 bottom-0 w-72 bg-slate-900 overflow-y-auto shadow-xl">
        {/* Quick Actions */}
        <div className="p-3 border-b border-slate-700 flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs"
            onClick={() => handleNavClick('/emergency-alerts')}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            SOS
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
            onClick={() => {
              // Send I'm Okay status
              fetch('/api/trpc/emergency.sendImOkayStatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({})
              }).catch(() => {});
              setIsOpen(false);
              window.dispatchEvent(new Event('closeMobileMenu'));
            }}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            I'm OK
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 text-xs"
            onClick={() => handleNavClick('/search')}
          >
            <Search className="h-3 w-3 mr-1" />
            Search
          </Button>
        </div>

        {/* Menu Sections */}
        <div className="py-2">
          {menuSections.map((section) => {
            const SectionIcon = section.icon;
            const expanded = expandedSections[section.title] || false;
            
            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-4 py-3 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <SectionIcon className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-semibold">{section.title}</span>
                  </div>
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </button>
                
                {expanded && (
                  <div className="pb-1">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.href}
                          onClick={() => handleNavClick(item.href, item.external)}
                          className={`w-full flex items-center gap-2 px-6 py-2 text-sm transition-colors ${
                            isActive(item.href)
                              ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-400'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {ItemIcon && <ItemIcon className="h-3.5 w-3.5" />}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Button */}
        <div className="p-3 border-t border-slate-700">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handleNavClick('/donate')}
          >
            <Heart className="h-4 w-4 mr-2" />
            Support the Legacy
          </Button>
        </div>
      </div>
    </div>
  );
}
