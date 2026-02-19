'use client';

import React, { useState } from 'react';
import { X, Music, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionMenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionMenuProps {
  items: FloatingActionMenuItem[];
  primaryIcon?: React.ReactNode;
  primaryLabel?: string;
}

export function FloatingActionMenu({
  items,
  primaryIcon = <Music className="w-6 h-6" />,
  primaryLabel = 'Menu',
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (item: FloatingActionMenuItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:hidden">
      {/* Menu Items - Appear above the main button when open */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center justify-end gap-2">
              <span className="text-xs text-foreground/70 bg-background/80 px-2 py-1 rounded whitespace-nowrap">
                {item.label}
              </span>
              <button
                onClick={() => handleItemClick(item)}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110',
                  item.color || 'bg-amber-500 hover:bg-amber-600'
                )}
                title={item.label}
              >
                {item.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'rounded-full w-14 h-14 p-0 text-white shadow-lg transition-all duration-200',
          isOpen
            ? 'bg-red-500 hover:bg-red-600 rotate-45'
            : 'bg-orange-500 hover:bg-orange-600'
        )}
        title={primaryLabel}
      >
        {isOpen ? <X className="w-6 h-6" /> : primaryIcon}
      </Button>
    </div>
  );
}
