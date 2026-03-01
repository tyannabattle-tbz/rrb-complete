import React, { useEffect, useState } from 'react';
import { useUserCapability } from '@/hooks/useUserCapability';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { AccessibilitySettings } from '@/components/AccessibilitySettings';
import { CapabilityLevelIndicator } from '@/components/AdaptiveUIWrapper';
import { SacredGeometryVisualizer, TemporalBridge } from '@/components/SacredGeometryVisualizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SOLFEGGIO_FREQUENCIES, CHAKRA_SYSTEM } from '@/utils/sacredGeometry';
import { Zap, Radio, AlertCircle } from 'lucide-react';

export default function FuturePastBridge() {
  const { profile, recordFeatureInteraction } = useUserCapability();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState(528);
  const [selectedChakra, setSelectedChakra] = useState<keyof typeof CHAKRA_SYSTEM>('heart');

  useEffect(() => {
    // Check if user is new (no interactions)
    if (profile.interactionCount === 0) {
      setShowOnboarding(true);
    }
  }, [profile.interactionCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Accessibility Settings Button */}
      <AccessibilitySettings />

      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🌉</div>
              <div>
                <h1 className="text-3xl font-bold text-white">Future-Past Bridge</h1>
                <p className="text-sm text-purple-300">Adaptive Communication Ecosystem</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CapabilityLevelIndicator />
              <Badge className="bg-green-500/20 text-green-400">
                ✓ All Systems Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Temporal Bridge Visualization */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">The Bridge Connecting All Time</h2>
          <div className="bg-slate-800/30 rounded-lg p-8 border border-purple-500/20">
            <div className="flex justify-center">
              <TemporalBridge />
            </div>
          </div>
        </section>

        {/* Three System Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Qumus */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border-purple-500/30 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-8 h-8 text-purple-400" />
                <CardTitle>Qumus</CardTitle>
              </div>
              <CardDescription>Orchestration Engine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">
                90% autonomous control. Learns from your behavior and adapts to your needs.
              </p>
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Current Level: <span className="text-purple-300 font-semibold capitalize">{profile.level}</span></p>
                <p className="text-xs text-slate-400">Confidence: <span className="text-purple-300 font-semibold">{profile.confidence}%</span></p>
                <p className="text-xs text-slate-400">Features Used: <span className="text-purple-300 font-semibold">{profile.detectedFeatures.length}</span></p>
              </div>
              <Button
                onClick={() => recordFeatureInteraction('qumusControl', 'advanced')}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Control Panel
              </Button>
            </CardContent>
          </Card>

          {/* RRB Radio */}
          <Card className="bg-gradient-to-br from-pink-900/50 to-slate-900/50 border-pink-500/30 hover:border-pink-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <Radio className="w-8 h-8 text-pink-400" />
                <CardTitle>RRB Radio</CardTitle>
              </div>
              <CardDescription>24/7 Broadcasting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">
                Rockin' Rockin' Boogie - healing frequencies, shows, and community.
              </p>
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Status: <span className="text-pink-300 font-semibold">🟢 Live</span></p>
                <p className="text-xs text-slate-400">Listeners: <span className="text-pink-300 font-semibold">2,847</span></p>
                <p className="text-xs text-slate-400">Shows: <span className="text-pink-300 font-semibold">12</span></p>
              </div>
              <Button
                onClick={() => recordFeatureInteraction('rrbRadio', 'intermediate')}
                className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
              >
                Go Live
              </Button>
            </CardContent>
          </Card>

          {/* HybridCast */}
          <Card className="bg-gradient-to-br from-red-900/50 to-slate-900/50 border-red-500/30 hover:border-red-500/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <CardTitle>HybridCast</CardTitle>
              </div>
              <CardDescription>Emergency Broadcast</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">
                Offline-first emergency alerts with mesh networking support.
              </p>
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Status: <span className="text-red-300 font-semibold">🟢 Ready</span></p>
                <p className="text-xs text-slate-400">Alerts: <span className="text-red-300 font-semibold">0</span></p>
                <p className="text-xs text-slate-400">Coverage: <span className="text-red-300 font-semibold">Global</span></p>
              </div>
              <Button
                onClick={() => recordFeatureInteraction('hybridcast', 'advanced')}
                className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700"
              >
                Emergency Panel
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Healing Frequencies */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Solfeggio Healing Frequencies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Frequency Selector */}
            <div className="space-y-4">
              <p className="text-sm text-slate-300 mb-4">Select a frequency to experience its healing properties:</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(SOLFEGGIO_FREQUENCIES).map((freq) => (
                  <button
                    key={freq.hz}
                    onClick={() => {
                      setSelectedFrequency(freq.hz);
                      recordFeatureInteraction('healingFrequencies', 'intermediate');
                    }}
                    className={`p-3 rounded-lg transition-all text-sm font-medium ${
                      selectedFrequency === freq.hz
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {freq.hz}Hz
                  </button>
                ))}
              </div>

              {/* Frequency Details */}
              {Object.values(SOLFEGGIO_FREQUENCIES).find((f) => f.hz === selectedFrequency) && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {Object.values(SOLFEGGIO_FREQUENCIES).find((f) => f.hz === selectedFrequency)?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400">Chakra</p>
                      <p className="text-sm text-slate-200">
                        {Object.values(SOLFEGGIO_FREQUENCIES).find((f) => f.hz === selectedFrequency)?.chakra}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Description</p>
                      <p className="text-sm text-slate-200">
                        {Object.values(SOLFEGGIO_FREQUENCIES).find((f) => f.hz === selectedFrequency)?.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Frequency Visualizer */}
            <div className="flex items-center justify-center">
              <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700">
                <SacredGeometryVisualizer
                  type="frequency"
                  frequency={selectedFrequency}
                  size={300}
                  interactive
                />
              </div>
            </div>
          </div>
        </section>

        {/* Chakra System */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Chakra System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chakra Selector */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CHAKRA_SYSTEM).map(([key, chakra]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedChakra(key as keyof typeof CHAKRA_SYSTEM);
                      recordFeatureInteraction('chakraSystem', 'intermediate');
                    }}
                    className={`p-3 rounded-lg transition-all text-sm font-medium text-left ${
                      selectedChakra === key
                        ? 'ring-2 ring-offset-2 ring-offset-slate-900 bg-purple-600/30'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {chakra.name}
                  </button>
                ))}
              </div>

              {/* Chakra Details */}
              {CHAKRA_SYSTEM[selectedChakra] && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg">{CHAKRA_SYSTEM[selectedChakra].name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400">Element</p>
                      <p className="text-sm text-slate-200">{CHAKRA_SYSTEM[selectedChakra].element}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Frequency</p>
                      <p className="text-sm text-slate-200">{CHAKRA_SYSTEM[selectedChakra].frequency} Hz</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="text-sm text-slate-200">{CHAKRA_SYSTEM[selectedChakra].location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Affirmation</p>
                      <p className="text-sm italic text-slate-200">{CHAKRA_SYSTEM[selectedChakra].affirmation}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Chakra Visualizer */}
            <div className="flex items-center justify-center">
              <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700">
                <SacredGeometryVisualizer
                  type="chakra"
                  chakra={selectedChakra}
                  size={300}
                  interactive
                />
              </div>
            </div>
          </div>
        </section>

        {/* User Profile Info */}
        <section className="mb-16">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Capability Level</p>
                  <p className="text-lg font-bold text-purple-400 capitalize">{profile.level}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Confidence</p>
                  <p className="text-lg font-bold text-blue-400">{profile.confidence}%</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Interactions</p>
                  <p className="text-lg font-bold text-green-400">{profile.interactionCount}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Features Used</p>
                  <p className="text-lg font-bold text-pink-400">{profile.detectedFeatures.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>🌉 Future-Past Bridge • Adaptive • Accessible • Sovereign</p>
          <p className="text-sm mt-2">Qumus (3000) • RRB (3001) • HybridCast (3002)</p>
        </div>
      </footer>
    </div>
  );
}
