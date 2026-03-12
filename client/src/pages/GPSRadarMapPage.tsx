import { useState } from 'react';
import FlatWorldMap from '@/components/FlatWorldMap';
import HybridCastBroadcaster from '@/components/HybridCastBroadcaster';
import { HybridCastBroadcastEnhanced } from '@/components/HybridCastBroadcastEnhanced';
import { languages, translate, type Language } from '@/lib/translator';
import { Earth } from 'lucide-react';

export function GPSRadarMapPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [locations] = useState([
    { lat: 40.7128, lng: -74.006, name: 'New York', type: 'user' as const },
    { lat: 51.5074, lng: -0.1278, name: 'London', type: 'target' as const },
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo', type: 'broadcast' as const },
    { lat: -33.8688, lng: 151.2093, name: 'Sydney', type: 'user' as const },
  ]);

  const t = (key: string) => translate(key, language);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      {/* Header with Language Selector */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {t('map.title')}
          </h1>
          
          {/* Language Selector */}
          <div className="flex items-center gap-3">
            <Earth className="w-5 h-5 text-cyan-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="px-4 py-2 bg-slate-800 border border-cyan-500 rounded-lg text-white font-medium hover:bg-slate-700 transition-colors"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-slate-400 text-lg">
          {t('app.subtitle')}
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Flat World Map */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <FlatWorldMap
            locations={locations}
            onLocationClick={(location) => {
              console.log('Selected location:', location);
            }}
          />
        </div>

        {/* HybridCast Broadcaster - Enhanced */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <HybridCastBroadcastEnhanced />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="text-sm font-semibold text-cyan-400 mb-2">Tracked Locations</div>
            <div className="text-2xl font-bold text-white">{locations.length}</div>
            <p className="text-xs text-slate-400 mt-1">Active tracking points</p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="text-sm font-semibold text-cyan-400 mb-2">Coverage</div>
            <div className="text-2xl font-bold text-white">Global</div>
            <p className="text-xs text-slate-400 mt-1">Worldwide tracking enabled</p>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="text-sm font-semibold text-cyan-400 mb-2">Broadcast Status</div>
            <div className="text-2xl font-bold text-white">Ready</div>
            <p className="text-xs text-slate-400 mt-1">HybridCast available</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">Flat World Map</h3>
                <p className="text-sm text-slate-400">Interactive 2D map with zoom and pan controls</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">Multi-Language Support</h3>
                <p className="text-sm text-slate-400">6 languages: English, Spanish, French, German, Japanese, Chinese</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">HybridCast Broadcasting</h3>
                <p className="text-sm text-slate-400">Live streaming with adaptive bitrate and multi-platform support</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">Real-time Tracking</h3>
                <p className="text-sm text-slate-400">Track multiple locations with live updates and status monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
