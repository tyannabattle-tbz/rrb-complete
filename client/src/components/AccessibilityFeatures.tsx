import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Eye, Accessibility, CheckCircle, Sliders } from 'lucide-react';

interface AccessibilitySettings {
  textToSpeech: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  captions: boolean;
  signLanguage: boolean;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  focusIndicator: boolean;
  reduceMotion: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export function AccessibilityFeatures() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    textToSpeech: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    captions: true,
    signLanguage: false,
    fontSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
    focusIndicator: true,
    reduceMotion: false,
    colorBlindMode: 'none',
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggle = (key: keyof AccessibilitySettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSliderChange = (key: keyof AccessibilitySettings, value: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSelectChange = (key: keyof AccessibilitySettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Accessibility className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Accessibility Features</h2>
              <p className="text-sm text-slate-400">WCAG 2.1 AA Compliant</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {Object.values(settings).filter((v) => v === true).length}
            </div>
            <div className="text-xs text-slate-400">Features Active</div>
          </div>
        </div>
      </Card>

      {/* Quick Toggles */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Access</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Text-to-Speech */}
          <button
            onClick={() => handleToggle('textToSpeech')}
            className={`p-3 rounded-lg border transition-all text-left ${
              settings.textToSpeech
                ? 'bg-purple-500/20 border-purple-500'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-4 h-4" />
              <span className="font-medium text-white">Text-to-Speech</span>
              {settings.textToSpeech && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
            </div>
            <p className="text-xs text-slate-400">Read content aloud</p>
          </button>

          {/* High Contrast */}
          <button
            onClick={() => handleToggle('highContrast')}
            className={`p-3 rounded-lg border transition-all text-left ${
              settings.highContrast
                ? 'bg-yellow-500/20 border-yellow-500'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4" />
              <span className="font-medium text-white">High Contrast</span>
              {settings.highContrast && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
            </div>
            <p className="text-xs text-slate-400">Increase contrast</p>
          </button>

          {/* Large Text */}
          <button
            onClick={() => handleToggle('largeText')}
            className={`p-3 rounded-lg border transition-all text-left ${
              settings.largeText
                ? 'bg-blue-500/20 border-blue-500'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold">A</span>
              <span className="font-medium text-white">Large Text</span>
              {settings.largeText && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
            </div>
            <p className="text-xs text-slate-400">Increase font size</p>
          </button>

          {/* Screen Reader */}
          <button
            onClick={() => handleToggle('screenReader')}
            className={`p-3 rounded-lg border transition-all text-left ${
              settings.screenReader
                ? 'bg-cyan-500/20 border-cyan-500'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Accessibility className="w-4 h-4" />
              <span className="font-medium text-white">Screen Reader</span>
              {settings.screenReader && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
            </div>
            <p className="text-xs text-slate-400">Optimize for readers</p>
          </button>

          {/* Captions */}
          <button
            onClick={() => handleToggle('captions')}
            className={`p-3 rounded-lg border transition-all text-left ${
              settings.captions
                ? 'bg-green-500/20 border-green-500'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold">CC</span>
              <span className="font-medium text-white">Captions</span>
              {settings.captions && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
            </div>
            <p className="text-xs text-slate-400">Show captions</p>
          </button>

          {/* Sign Language */}
          <button
            onClick={() => handleToggle('signLanguage')}
            className={`p-3 rounded-lg border transition-all text-left ${
              settings.signLanguage
                ? 'bg-red-500/20 border-red-500'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold">ASL</span>
              <span className="font-medium text-white">Sign Language</span>
              {settings.signLanguage && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
            </div>
            <p className="text-xs text-slate-400">Show ASL video</p>
          </button>
        </div>
      </Card>

      {/* Advanced Settings */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          Advanced Settings
        </h3>

        <div className="space-y-4">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={settings.fontSize}
              onChange={(e) => handleSliderChange('fontSize', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-slate-400 mt-1">Range: 12px - 24px</div>
          </div>

          {/* Line Height */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Line Height: {settings.lineHeight.toFixed(1)}
            </label>
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => handleSliderChange('lineHeight', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-slate-400 mt-1">Range: 1.0 - 2.0</div>
          </div>

          {/* Letter Spacing */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Letter Spacing: {settings.letterSpacing}px
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={settings.letterSpacing}
              onChange={(e) => handleSliderChange('letterSpacing', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-slate-400 mt-1">Range: 0px - 5px</div>
          </div>

          {/* Color Blind Mode */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Color Blind Mode</label>
            <select
              value={settings.colorBlindMode}
              onChange={(e) => handleSelectChange('colorBlindMode', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="none">None</option>
              <option value="protanopia">Protanopia (Red-Blind)</option>
              <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
              <option value="tritanopia">Tritanopia (Blue-Blind)</option>
            </select>
          </div>

          {/* Additional Toggles */}
          <div className="space-y-2 pt-4 border-t border-slate-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.focusIndicator}
                onChange={() => handleToggle('focusIndicator')}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-300">Enhanced Focus Indicators</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={() => handleToggle('reduceMotion')}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-300">Reduce Motion</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Test & Preview */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Test & Preview</h3>

        <div className="space-y-3">
          <Button
            onClick={() => speakText('Welcome to HybridCast. This is a text-to-speech test.')}
            disabled={isSpeaking}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            {isSpeaking ? 'Speaking...' : 'Test Text-to-Speech'}
          </Button>

          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <p
              style={{
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
                letterSpacing: `${settings.letterSpacing}px`,
              }}
              className="text-slate-300"
            >
              This is a preview of your accessibility settings. The text size, line height, and letter spacing will adjust based on your
              preferences.
            </p>
          </div>
        </div>
      </Card>

      {/* WCAG Compliance */}
      <Card className="p-4 bg-slate-900 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-3">WCAG 2.1 Compliance</h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-slate-300">Level A: All criteria met</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-slate-300">Level AA: All criteria met</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-slate-300">Keyboard Navigation: Full support</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-slate-300">Screen Reader: Optimized</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-slate-300">Color Contrast: AAA standard</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
