import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Volume2, Eye, Keyboard, Zap, Settings, X } from "lucide-react";

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: number;
  screenReader: boolean;
  captions: boolean;
  audioDescriptions: boolean;
  keyboardNavigation: boolean;
  reduceMotion: boolean;
  colorBlindMode: "none" | "deuteranopia" | "protanopia" | "tritanopia";
  textSpacing: number;
  focusIndicator: boolean;
}

export const AccessibilityPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem("accessibilitySettings");
    return saved
      ? JSON.parse(saved)
      : {
          highContrast: false,
          fontSize: 16,
          screenReader: false,
          captions: true,
          audioDescriptions: false,
          keyboardNavigation: true,
          reduceMotion: false,
          colorBlindMode: "none",
          textSpacing: 1,
          focusIndicator: true,
        };
  });

  useEffect(() => {
    localStorage.setItem("accessibilitySettings", JSON.stringify(settings));
    applyAccessibilitySettings(settings);
  }, [settings]);

  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // High contrast mode
    if (newSettings.highContrast) {
      root.style.filter = "contrast(1.5)";
    } else {
      root.style.filter = "contrast(1)";
    }

    // Font size
    root.style.fontSize = `${newSettings.fontSize}px`;

    // Text spacing
    root.style.letterSpacing = `${newSettings.textSpacing * 0.05}em`;
    root.style.lineHeight = `${1.5 * newSettings.textSpacing}`;

    // Reduce motion
    if (newSettings.reduceMotion) {
      root.style.setProperty("--transition-duration", "0s");
    } else {
      root.style.setProperty("--transition-duration", "0.3s");
    }

    // Color blind mode
    switch (newSettings.colorBlindMode) {
      case "deuteranopia":
        root.style.filter = "url(#deuteranopia)";
        break;
      case "protanopia":
        root.style.filter = "url(#protanopia)";
        break;
      case "tritanopia":
        root.style.filter = "url(#tritanopia)";
        break;
      default:
        root.style.filter = newSettings.highContrast ? "contrast(1.5)" : "contrast(1)";
    }

    // Focus indicator
    if (newSettings.focusIndicator) {
      root.style.setProperty("--focus-outline", "3px solid #4F46E5");
    } else {
      root.style.setProperty("--focus-outline", "none");
    }

    // Screen reader announcement
    if (newSettings.screenReader) {
      announceToScreenReader("Accessibility settings updated");
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  };

  return (
    <>
      {/* Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <Settings size={24} />
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-50 w-96 max-h-96 overflow-y-auto p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Accessibility</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 rounded"
              aria-label="Close accessibility panel"
            >
              <X size={20} />
            </button>
          </div>

          {/* Vision Settings */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Eye size={20} /> Vision
            </h3>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <label htmlFor="highContrast" className="text-sm font-medium">
                High Contrast Mode
              </label>
              <Switch
                id="highContrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, highContrast: checked })
                }
              />
            </div>

            {/* Font Size */}
            <div>
              <label htmlFor="fontSize" className="text-sm font-medium block mb-2">
                Font Size: {settings.fontSize}px
              </label>
              <Slider
                id="fontSize"
                min={12}
                max={24}
                step={1}
                value={[settings.fontSize]}
                onValueChange={(value) =>
                  setSettings({ ...settings, fontSize: value[0] })
                }
              />
            </div>

            {/* Color Blind Mode */}
            <div>
              <label htmlFor="colorBlind" className="text-sm font-medium block mb-2">
                Color Blind Mode
              </label>
              <select
                id="colorBlind"
                value={settings.colorBlindMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    colorBlindMode: e.target.value as any,
                  })
                }
                className="w-full p-2 border rounded"
              >
                <option value="none">None</option>
                <option value="deuteranopia">Deuteranopia (Red-Green)</option>
                <option value="protanopia">Protanopia (Red-Green)</option>
                <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
              </select>
            </div>

            {/* Text Spacing */}
            <div>
              <label htmlFor="textSpacing" className="text-sm font-medium block mb-2">
                Text Spacing: {settings.textSpacing}x
              </label>
              <Slider
                id="textSpacing"
                min={1}
                max={2}
                step={0.1}
                value={[settings.textSpacing]}
                onValueChange={(value) =>
                  setSettings({ ...settings, textSpacing: value[0] })
                }
              />
            </div>

            {/* Focus Indicator */}
            <div className="flex items-center justify-between">
              <label htmlFor="focusIndicator" className="text-sm font-medium">
                Enhanced Focus Indicator
              </label>
              <Switch
                id="focusIndicator"
                checked={settings.focusIndicator}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, focusIndicator: checked })
                }
              />
            </div>
          </div>

          {/* Hearing Settings */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Volume2 size={20} /> Hearing
            </h3>

            {/* Captions */}
            <div className="flex items-center justify-between">
              <label htmlFor="captions" className="text-sm font-medium">
                Live Captions
              </label>
              <Switch
                id="captions"
                checked={settings.captions}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, captions: checked })
                }
              />
            </div>

            {/* Audio Descriptions */}
            <div className="flex items-center justify-between">
              <label htmlFor="audioDesc" className="text-sm font-medium">
                Audio Descriptions
              </label>
              <Switch
                id="audioDesc"
                checked={settings.audioDescriptions}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, audioDescriptions: checked })
                }
              />
            </div>
          </div>

          {/* Motor Settings */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Keyboard size={20} /> Motor
            </h3>

            {/* Keyboard Navigation */}
            <div className="flex items-center justify-between">
              <label htmlFor="keyboard" className="text-sm font-medium">
                Keyboard Navigation
              </label>
              <Switch
                id="keyboard"
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, keyboardNavigation: checked })
                }
              />
            </div>

            {/* Reduce Motion */}
            <div className="flex items-center justify-between">
              <label htmlFor="reduceMotion" className="text-sm font-medium">
                Reduce Motion
              </label>
              <Switch
                id="reduceMotion"
                checked={settings.reduceMotion}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, reduceMotion: checked })
                }
              />
            </div>
          </div>

          {/* Screen Reader */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Zap size={20} /> Assistive Tech
            </h3>

            <div className="flex items-center justify-between">
              <label htmlFor="screenReader" className="text-sm font-medium">
                Screen Reader Mode
              </label>
              <Switch
                id="screenReader"
                checked={settings.screenReader}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, screenReader: checked })
                }
              />
            </div>
          </div>

          {/* Reset Button */}
          <Button
            onClick={() => {
              const defaults = {
                highContrast: false,
                fontSize: 16,
                screenReader: false,
                captions: true,
                audioDescriptions: false,
                keyboardNavigation: true,
                reduceMotion: false,
                colorBlindMode: "none" as const,
                textSpacing: 1,
                focusIndicator: true,
              };
              setSettings(defaults);
              announceToScreenReader("Accessibility settings reset to defaults");
            }}
            className="w-full mt-4"
            variant="outline"
          >
            Reset to Defaults
          </Button>
        </Card>
      )}
    </>
  );
};
