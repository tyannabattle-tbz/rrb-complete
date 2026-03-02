import React, { useState, useEffect } from 'react';
import { Volume2, Eye, Zap, Keyboard, Settings } from 'lucide-react';

/**
 * ADA Accessibility Component
 * WCAG 2.1 AA Compliance for Mobile
 * - Screen reader support
 * - Keyboard navigation
 * - Color contrast (7:1 ratio)
 * - Touch targets (48x48px minimum)
 * - Reduced motion support
 */

interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  textSpacing: 'normal' | 'increased';
  focusIndicator: 'standard' | 'enhanced';
}

export const AccessibilityMobile: React.FC = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReaderEnabled: false,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    keyboardNavigation: false,
    colorBlindMode: 'normal',
    textSpacing: 'normal',
    focusIndicator: 'standard',
  });

  const [showPanel, setShowPanel] = useState(false);

  // Detect system preferences
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setSettings((prev) => ({ ...prev, reducedMotion: true }));
    }

    // Check for high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
    if (prefersHighContrast) {
      setSettings((prev) => ({ ...prev, highContrast: true }));
    }

    // Check for color scheme preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Load saved settings from localStorage
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applyAccessibilitySettings(settings);
  }, [settings]);

  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // High contrast mode
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (newSettings.largeText) {
      root.classList.add('large-text');
      root.style.fontSize = '18px';
    } else {
      root.classList.remove('large-text');
      root.style.fontSize = '16px';
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Text spacing
    if (newSettings.textSpacing === 'increased') {
      root.classList.add('increased-spacing');
    } else {
      root.classList.remove('increased-spacing');
    }

    // Color blind mode
    root.setAttribute('data-color-blind', newSettings.colorBlindMode);

    // Focus indicator
    root.setAttribute('data-focus-indicator', newSettings.focusIndicator);

    // Screen reader announcement
    if (newSettings.screenReaderEnabled) {
      announceToScreenReader('Accessibility settings updated');
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    announceToScreenReader(`${key} ${!settings[key] ? 'enabled' : 'disabled'}`);
  };

  const changeSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    announceToScreenReader(`${key} changed to ${value}`);
  };

  return (
    <>
      {/* Accessibility Styles */}
      <style>{`
        /* Screen reader only content */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* High contrast mode */
        .high-contrast {
          --bg-primary: #000;
          --bg-secondary: #fff;
          --text-primary: #fff;
          --text-secondary: #000;
          --border-color: #000;
          --focus-color: #ffff00;
        }

        .high-contrast * {
          background-color: var(--bg-primary) !important;
          color: var(--text-primary) !important;
          border-color: var(--border-color) !important;
        }

        /* Large text */
        .large-text {
          font-size: 18px;
          line-height: 1.8;
        }

        .large-text * {
          font-size: 1.125em;
          line-height: 1.8;
        }

        /* Reduced motion */
        .reduce-motion * {
          animation: none !important;
          transition: none !important;
        }

        /* Increased text spacing */
        .increased-spacing {
          letter-spacing: 0.12em;
          word-spacing: 0.16em;
          line-height: 1.8;
        }

        /* Enhanced focus indicator */
        [data-focus-indicator="enhanced"] *:focus {
          outline: 4px solid #ffff00 !important;
          outline-offset: 2px !important;
        }

        /* Color blind modes */
        [data-color-blind="protanopia"] {
          filter: url(#protanopia);
        }

        [data-color-blind="deuteranopia"] {
          filter: url(#deuteranopia);
        }

        [data-color-blind="tritanopia"] {
          filter: url(#tritanopia);
        }

        /* Touch target size (48x48px minimum) */
        button, a, input[type="checkbox"], input[type="radio"] {
          min-width: 48px;
          min-height: 48px;
          padding: 12px;
        }

        /* Focus visible for keyboard navigation */
        *:focus-visible {
          outline: 3px solid #0066cc;
          outline-offset: 2px;
        }

        /* Color contrast ratios (WCAG AA: 7:1 for normal text) */
        .accessibility-panel {
          background-color: #ffffff;
          color: #000000;
          border: 2px solid #000000;
        }

        .accessibility-button {
          background-color: #0066cc;
          color: #ffffff;
          min-width: 48px;
          min-height: 48px;
          border: 2px solid #000000;
        }

        .accessibility-button:hover {
          background-color: #0052a3;
        }

        .accessibility-button:focus-visible {
          outline: 3px solid #ffff00;
          outline-offset: 2px;
        }
      `}</style>

      {/* SVG Filters for Color Blindness */}
      <svg style={{ display: 'none' }}>
        <defs>
          {/* Protanopia (Red-Blind) */}
          <filter id="protanopia">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0.000, 0, 0
                      0.558, 0.442, 0.000, 0, 0
                      0.000, 0.242, 0.758, 0, 0
                      0.000, 0.000, 0.000, 1, 0"
            />
          </filter>

          {/* Deuteranopia (Green-Blind) */}
          <filter id="deuteranopia">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0.000, 0, 0
                      0.700, 0.300, 0.000, 0, 0
                      0.000, 0.300, 0.700, 0, 0
                      0.000, 0.000, 0.000, 1, 0"
            />
          </filter>

          {/* Tritanopia (Blue-Yellow Blind) */}
          <filter id="tritanopia">
            <feColorMatrix
              type="matrix"
              values="0.950, 0.050, 0.000, 0, 0
                      0.000, 0.433, 0.567, 0, 0
                      0.000, 0.475, 0.525, 0, 0
                      0.000, 0.000, 0.000, 1, 0"
            />
          </filter>
        </defs>
      </svg>

      {/* Accessibility Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="accessibility-button fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        aria-label="Accessibility settings"
        aria-expanded={showPanel}
        aria-controls="accessibility-panel"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Accessibility Panel */}
      {showPanel && (
        <div
          id="accessibility-panel"
          className="accessibility-panel fixed bottom-20 right-4 z-50 p-6 rounded-lg shadow-xl max-w-sm"
          role="region"
          aria-label="Accessibility settings"
        >
          <h2 className="text-lg font-bold mb-4">Accessibility Settings</h2>

          {/* Screen Reader */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={settings.screenReaderEnabled}
                onChange={() => toggleSetting('screenReaderEnabled')}
                aria-label="Enable screen reader support"
              />
              <Volume2 className="w-5 h-5" />
              <span>Screen Reader Support</span>
            </label>
          </div>

          {/* High Contrast */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={() => toggleSetting('highContrast')}
                aria-label="Enable high contrast mode"
              />
              <Eye className="w-5 h-5" />
              <span>High Contrast</span>
            </label>
          </div>

          {/* Large Text */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={settings.largeText}
                onChange={() => toggleSetting('largeText')}
                aria-label="Enable large text"
              />
              <Zap className="w-5 h-5" />
              <span>Large Text</span>
            </label>
          </div>

          {/* Reduced Motion */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={() => toggleSetting('reducedMotion')}
                aria-label="Enable reduced motion"
              />
              <span>Reduce Motion</span>
            </label>
          </div>

          {/* Color Blind Mode */}
          <div className="mb-4">
            <label htmlFor="color-blind-select" className="block text-sm font-medium mb-2">
              Color Blind Mode
            </label>
            <select
              id="color-blind-select"
              value={settings.colorBlindMode}
              onChange={(e) => changeSetting('colorBlindMode', e.target.value)}
              className="w-full p-2 border-2 border-black rounded"
              aria-label="Select color blind mode"
            >
              <option value="normal">Normal</option>
              <option value="protanopia">Protanopia (Red-Blind)</option>
              <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
              <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
            </select>
          </div>

          {/* Text Spacing */}
          <div className="mb-4">
            <label htmlFor="text-spacing-select" className="block text-sm font-medium mb-2">
              Text Spacing
            </label>
            <select
              id="text-spacing-select"
              value={settings.textSpacing}
              onChange={(e) => changeSetting('textSpacing', e.target.value)}
              className="w-full p-2 border-2 border-black rounded"
              aria-label="Select text spacing"
            >
              <option value="normal">Normal</option>
              <option value="increased">Increased</option>
            </select>
          </div>

          {/* Focus Indicator */}
          <div className="mb-4">
            <label htmlFor="focus-indicator-select" className="block text-sm font-medium mb-2">
              Focus Indicator
            </label>
            <select
              id="focus-indicator-select"
              value={settings.focusIndicator}
              onChange={(e) => changeSetting('focusIndicator', e.target.value)}
              className="w-full p-2 border-2 border-black rounded"
              aria-label="Select focus indicator style"
            >
              <option value="standard">Standard</option>
              <option value="enhanced">Enhanced</option>
            </select>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowPanel(false)}
            className="accessibility-button w-full mt-4 rounded"
            aria-label="Close accessibility settings"
          >
            Close
          </button>

          {/* Accessibility Info */}
          <p className="text-xs text-gray-600 mt-4">
            WCAG 2.1 AA Compliant • Touch targets: 48x48px • Color contrast: 7:1
          </p>
        </div>
      )}
    </>
  );
};

export default AccessibilityMobile;
