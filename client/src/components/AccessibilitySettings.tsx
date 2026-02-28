import React, { useEffect } from 'react';
import { useUserCapability, AccessibilityProfile } from '@/hooks/useUserCapability';
import { Settings, Eye, Volume2, Keyboard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Accessibility Settings Component
 * Provides comprehensive accessibility options for all users
 */
export const AccessibilitySettings: React.FC = () => {
  const { profile, updateAccessibility } = useUserCapability();
  const [isOpen, setIsOpen] = React.useState(false);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    const a11y = profile.accessibilityProfile;

    if (a11y?.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (a11y?.largeText) {
      root.classList.add('large-text');
      root.style.fontSize = '18px';
    } else {
      root.classList.remove('large-text');
      root.style.fontSize = '16px';
    }

    if (a11y?.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    if (a11y?.dyslexiaFont) {
      root.classList.add('dyslexia-font');
      root.style.fontFamily = 'OpenDyslexic, sans-serif';
    } else {
      root.classList.remove('dyslexia-font');
    }

    if (a11y?.colorBlindMode && a11y.colorBlindMode !== 'none') {
      root.classList.add(`colorblind-${a11y.colorBlindMode}`);
    } else {
      root.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
    }

    if (a11y?.screenReaderOptimized) {
      root.setAttribute('role', 'application');
    }
  }, [profile.accessibilityProfile]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 p-3 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white hover:shadow-lg transition-all hover:scale-110 z-40"
        title="Accessibility Settings"
        aria-label="Accessibility Settings"
      >
        <Settings className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Accessibility Settings</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-300 text-2xl"
          >
            ×
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Visual Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Visual Settings
            </h3>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={profile.accessibilityProfile?.highContrast || false}
                onChange={(e) => updateAccessibility({ highContrast: e.target.checked })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-white">High Contrast Mode</p>
                <p className="text-sm text-slate-400">Increase contrast for better visibility</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={profile.accessibilityProfile?.largeText || false}
                onChange={(e) => updateAccessibility({ largeText: e.target.checked })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-white">Large Text</p>
                <p className="text-sm text-slate-400">Increase font size for easier reading</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={profile.accessibilityProfile?.reducedMotion || false}
                onChange={(e) => updateAccessibility({ reducedMotion: e.target.checked })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-white">Reduced Motion</p>
                <p className="text-sm text-slate-400">Minimize animations and transitions</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={profile.accessibilityProfile?.dyslexiaFont || false}
                onChange={(e) => updateAccessibility({ dyslexiaFont: e.target.checked })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-white">Dyslexia-Friendly Font</p>
                <p className="text-sm text-slate-400">Use OpenDyslexic font for easier reading</p>
              </div>
            </label>

            {/* Color Blindness Mode */}
            <div className="p-3 rounded-lg bg-slate-800/50">
              <p className="font-medium text-white mb-2">Color Blindness Mode</p>
              <select
                value={profile.accessibilityProfile?.colorBlindMode || 'none'}
                onChange={(e) =>
                  updateAccessibility({
                    colorBlindMode: e.target.value as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia',
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="none">None</option>
                <option value="protanopia">Protanopia (Red-Blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                <option value="tritanopia">Tritanopia (Blue-Blind)</option>
              </select>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-pink-400" />
              Audio Settings
            </h3>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={profile.accessibilityProfile?.screenReaderOptimized || false}
                onChange={(e) => updateAccessibility({ screenReaderOptimized: e.target.checked })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-white">Screen Reader Optimized</p>
                <p className="text-sm text-slate-400">Optimize for screen reader compatibility</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={profile.accessibilityProfile?.voiceControl || false}
                onChange={(e) => updateAccessibility({ voiceControl: e.target.checked })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-white">Voice Control</p>
                <p className="text-sm text-slate-400">Enable voice commands and audio feedback</p>
              </div>
            </label>
          </div>

          {/* Motor/Input Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-green-400" />
              Input Settings
            </h3>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={profile.accessibilityProfile?.keyboardOnly || false}
                onChange={(e) => updateAccessibility({ keyboardOnly: e.target.checked })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-white">Keyboard Only</p>
                <p className="text-sm text-slate-400">Navigate using keyboard only (no mouse required)</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={profile.accessibilityProfile?.hapticFeedback || false}
                onChange={(e) => updateAccessibility({ hapticFeedback: e.target.checked })}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-white">Haptic Feedback</p>
                <p className="text-sm text-slate-400">Vibration feedback for interactions (mobile)</p>
              </div>
            </label>
          </div>

          {/* Presets */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Quick Presets
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() =>
                  updateAccessibility({
                    highContrast: true,
                    largeText: true,
                    reducedMotion: true,
                  })
                }
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                Low Vision
              </Button>
              <Button
                onClick={() =>
                  updateAccessibility({
                    screenReaderOptimized: true,
                    keyboardOnly: true,
                    voiceControl: true,
                  })
                }
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                Blind/VI
              </Button>
              <Button
                onClick={() =>
                  updateAccessibility({
                    dyslexiaFont: true,
                    largeText: true,
                    highContrast: true,
                  })
                }
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                Dyslexia
              </Button>
              <Button
                onClick={() =>
                  updateAccessibility({
                    reducedMotion: true,
                    hapticFeedback: false,
                  })
                }
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                Motor
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilitySettings;
