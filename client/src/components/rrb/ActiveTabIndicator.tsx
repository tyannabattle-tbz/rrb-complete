import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';

interface NavItem {
  label: string;
  href: string;
}

interface ActiveTabIndicatorProps {
  items: NavItem[];
}

export function ActiveTabIndicator({ items }: ActiveTabIndicatorProps) {
  const [location] = useLocation();
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    const index = items.findIndex((item) => {
      // Exact match for root path
      if (item.href === '/' && location === '/') return true;
      // Prefix match for other paths
      if (item.href !== '/' && location.startsWith(item.href)) return true;
      return false;
    });
    setActiveIndex(index);
  }, [location, items]);

  if (activeIndex === -1) return null;

  return (
    <div
      className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-300 ease-out"
      style={{
        width: `${100 / items.length}%`,
        transform: `translateX(${activeIndex * 100}%)`,
      }}
    />
  );
}
