/**
 * RRB Menu Sidebar Component
 * Mobile-responsive sidebar with all RRB navigation items
 * Features: Icons, collapsible sections, active route highlighting, smooth animations
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronDown, Book, Music, Vault, MessageSquare, Heart, Users, Info, Clapperboard, Radio, Video, Zap, Gamepad2, Heart as HeartIcon, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    section: 'LEGACY VAULT',
    items: [
      { id: 'legacy', label: 'The Legacy', path: '/rrb/legacy', icon: <Book className="w-5 h-5" /> },
      { id: 'music', label: 'The Music', path: '/rrb/music', icon: <Music className="w-5 h-5" /> },
      { id: 'proof', label: 'Proof Vault', path: '/rrb/proof-vault', icon: <Vault className="w-5 h-5" /> },
      { id: 'testimonials', label: 'Testimonials', path: '/rrb/testimonials', icon: <MessageSquare className="w-5 h-5" /> },
      { id: 'grandma', label: 'Grandma Helen', path: '/rrb/grandma-helen', icon: <Heart className="w-5 h-5" /> },
      { id: 'family', label: 'Family Legacy', path: '/rrb/family-legacy', icon: <Users className="w-5 h-5" /> },
      { id: 'about', label: 'About RRB', path: '/rrb/about', icon: <Info className="w-5 h-5" /> },
      { id: 'canryn', label: 'Canryn Prod.', path: '/rrb/canryn', icon: <Clapperboard className="w-5 h-5" /> },
    ],
  },
  {
    section: 'LISTENING EXPERIENCE',
    items: [
      { id: 'radio', label: 'Radio', path: '/rrb/radio', icon: <Radio className="w-5 h-5" /> },
      { id: 'podcast', label: 'Podcast & Video', path: '/rrb/podcast-video', icon: <Video className="w-5 h-5" /> },
      { id: 'wellness', label: 'Wellness', path: '/rrb/wellness', icon: <Zap className="w-5 h-5" /> },
      { id: 'solbones', label: 'Solbones Game', path: '/rrb/solbones-game', icon: <Gamepad2 className="w-5 h-5" /> },
    ],
  },
  {
    section: 'COMMUNITY',
    items: [
      { id: 'donate', label: 'Donate', path: '/rrb/donate', icon: <HeartIcon className="w-5 h-5" /> },
      { id: 'contact', label: 'Contact', path: '/rrb/contact', icon: <Mail className="w-5 h-5" /> },
    ],
  },
];

interface RRBMenuSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const RRBMenuSidebar: React.FC<RRBMenuSidebarProps> = ({ isOpen = true, onClose }) => {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(menuSections.map((s) => s.section))
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const isActive = (path: string) => location === path;

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-amber-900 to-amber-950 text-white shadow-lg overflow-y-auto transition-transform duration-300 z-40',
        !isOpen && '-translate-x-full'
      )}
    >
      {/* Header */}
      <div className="sticky top-0 bg-amber-950 p-4 border-b border-amber-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-amber-400">RRB</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-amber-400 hover:text-amber-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Menu Sections */}
      <div className="p-4 space-y-2">
        {menuSections.map((section) => (
          <div key={section.section} className="space-y-1">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.section)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
            >
              <span>{section.section}</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  expandedSections.has(section.section) && 'rotate-180'
                )}
              />
            </button>

            {/* Section Items */}
            {expandedSections.has(section.section) && (
              <div className="space-y-1 ml-2">
                {section.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.path}
                    onClick={() => onClose?.()}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                      isActive(item.path)
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-amber-100 hover:bg-amber-800 hover:text-white'
                    )}
                  >
                    <span className={cn('flex-shrink-0', isActive(item.path) && 'text-amber-300')}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive(item.path) && (
                      <span className="ml-auto w-2 h-2 bg-amber-300 rounded-full"></span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-amber-800 bg-gradient-to-t from-amber-950 to-transparent">
        <p className="text-xs text-amber-400 text-center">
          Rockin Rockin Boogie<br />
          A Voice for the Voiceless
        </p>
      </div>
    </div>
  );
};

export default RRBMenuSidebar;
