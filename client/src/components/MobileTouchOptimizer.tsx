import React, { ReactNode } from 'react';

interface MobileTouchOptimizerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper component that ensures touch targets meet WCAG accessibility standards
 * Minimum touch target size: 44x44px (recommended for mobile)
 */
export function MobileTouchOptimizer({
  children,
  className = '',
}: MobileTouchOptimizerProps) {
  return (
    <div className={`touch-target-optimized ${className}`}>
      {children}
    </div>
  );
}

/**
 * CSS utility classes for mobile touch optimization
 * Add to your global CSS or use as Tailwind utilities
 */
export const mobileTouchStyles = `
  /* Ensure minimum 44x44px touch targets on mobile */
  @media (max-width: 768px) {
    button, a, input[type="checkbox"], input[type="radio"] {
      min-height: 44px;
      min-width: 44px;
      padding: 12px 16px;
    }

    /* Ensure adequate spacing between touch targets */
    button + button,
    a + a,
    button + a {
      margin-left: 8px;
    }

    /* Optimize form inputs for mobile */
    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="search"],
    textarea,
    select {
      min-height: 44px;
      font-size: 16px; /* Prevents auto-zoom on iOS */
      padding: 12px 16px;
    }

    /* Optimize select dropdowns */
    select {
      padding: 12px 16px;
      font-size: 16px;
    }

    /* Ensure menu items are easily tappable */
    nav button,
    nav a {
      padding: 12px 16px;
      min-height: 44px;
    }

    /* Optimize card interactions */
    .card-interactive {
      min-height: 60px;
      padding: 16px;
    }

    /* Ensure list items are tappable */
    li button,
    li a {
      padding: 12px 16px;
      min-height: 44px;
      display: flex;
      align-items: center;
    }

    /* Optimize icon buttons */
    button svg,
    a svg {
      min-width: 24px;
      min-height: 24px;
    }

    /* Remove horizontal scrolling */
    body {
      overflow-x: hidden;
    }

    /* Ensure full-width content on mobile */
    .container {
      width: 100%;
      padding: 0 16px;
      max-width: 100%;
    }

    /* Optimize spacing for mobile */
    .gap-2 {
      gap: 8px;
    }

    .gap-4 {
      gap: 12px;
    }

    /* Ensure text is readable without zoom */
    body {
      font-size: 16px;
    }

    /* Optimize focus states for touch */
    button:focus-visible,
    a:focus-visible,
    input:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
  }
`;

/**
 * Hook to detect if device is mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
