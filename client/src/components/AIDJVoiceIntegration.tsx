import React, { useState } from 'react';
import { Mic2, Play, Pause, Volume2, Settings, Sparkles } from 'lucide-react';

interface AIDJConfig {
  dj: 'valanna' | 'candy' | 'seraph';
  introText: string;
  outroText: string;
  voiceSpeed: number;
  voicePitch: number;
  energy: 'low' | 'medium' | 'high';
  isPlaying: boolean;
}

export const AIDJVoiceIntegration: React.FC = () => {
  const [config, setConfig] = useState<AIDJConfig>({
    dj: 'valanna',
    introText: 'Welcome to RRB Soul & R&B Night! I\'m Valanna, your AI DJ for this evening\'s performance.',
    outroText: 'Thanks for tuning in to RRB! Don\'t forget to subscribe and join us next week for more amazing music!',
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    energy: 'high',
    isPlaying: false,
  });

  const [activeTab, setActiveTab] = useState<'intro' | 'outro' | 'settings'>('intro');

  const djProfiles = {
    valanna: {
      name: 'Valanna',
      description: 'Smooth, sophisticated DJ with a warm, engaging voice',
      color: 'from-pink-500 to-rose-500',
      icon: '🎙️',
      defaultEnergy: 'high',
    },
    candy: {
      name: 'Candy',
      description: 'Energetic and playful DJ with infectious enthusiasm',
      color: 'from-purple-500 to-pink-500',
      icon: '🎵',
      defaultEnergy: 'high',
    },
    seraph: {
      name: 'Seraph',
      description: 'Mystical and ethereal DJ with healing frequency focus',
      color: 'from-cyan-500 to-blue-500',
      icon: '✨',
      defaultEnergy: 'medium',
    },
  };

  const handleDJChange = (dj: 'valanna' | 'candy' | 'seraph') => {
    setConfig(prev => ({
      ...prev,
      dj,
      energy: djProfiles[dj].defaultEnergy as 'low' | 'medium' | 'high',
    }));
  };

  const handleIntroChange = (text: string) => {
    setConfig(prev => ({ ...prev, introText: text }));
  };

  const handleOutroChange = (text: string) => {
    setConfig(prev => ({ ...prev, outroText: text }));
  };

  const handlePlayPreview = () => {
    setConfig(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    // In a real implementation, this would trigger text-to-speech
    setTimeout(() => {
      setConfig(prev => ({ ...prev, isPlaying: false }));
    }, 3000);
  };

  const currentDJ = djProfiles[config.dj];

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 rounded-lg space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-yellow-400" />
          AI DJ Voice Integration
        </h2>
      </div>

      {/* DJ Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Select Your AI DJ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(djProfiles).map(([key, dj]) => (
            <button
              key={key}
              onClick={() => handleDJChange(key as 'valanna' | 'candy' | 'seraph')}
              className={`p-4 rounded-lg border-2 transition ${
                config.dj === key
                  ? `border-white bg-gradient-to-br ${dj.color} bg-opacity-30`
                  : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
              }`}
            >
              <div className="text-3xl mb-2">{dj.icon}</div>
              <div className="text-white font-semibold">{dj.name}</div>
              <div className="text-slate-300 text-sm mt-1">{dj.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* DJ Profile Display */}
      <div className={`bg-gradient-to-br ${currentDJ.color} bg-opacity-20 border-2 border-${config.dj === 'valanna' ? 'pink' : config.dj === 'candy' ? 'purple' : 'cyan'}-500/50 rounded-lg p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl mb-2">{currentDJ.icon}</div>
            <div className="text-white text-2xl font-bold">{currentDJ.name}</div>
            <div className="text-slate-300 text-sm mt-1">{currentDJ.description}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-sm mb-2">Current Energy Level</div>
            <div className="text-3xl font-bold capitalize">
              {config.energy === 'low' ? '🔇' : config.energy === 'medium' ? '🔉' : '🔊'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {(['intro', 'outro', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === tab
                ? 'text-white border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab === 'intro' && 'Intro'}
            {tab === 'outro' && 'Outro'}
            {tab === 'settings' && 'Settings'}
          </button>
        ))}
      </div>

      {/* Intro Tab */}
      {activeTab === 'intro' && (
        <div className="space-y-4">
          <div>
            <label className="text-white font-semibold mb-2 block">Intro Message</label>
            <textarea
              value={config.introText}
              onChange={(e) => handleIntroChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-4 text-white focus:outline-none focus:border-purple-500 resize-none h-32"
              placeholder="Enter your intro message..."
            />
            <div className="text-xs text-slate-400 mt-1">
              Character count: {config.introText.length} / 500
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePlayPreview}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                config.isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {config.isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Stop Preview
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Preview Intro
                </>
              )}
            </button>
            <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold flex items-center gap-2 transition">
              <Mic2 className="w-5 h-5" />
              Record Custom
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="text-slate-300 text-sm">
              <div className="font-semibold mb-2">Preview:</div>
              <div className="italic text-slate-400">"{config.introText}"</div>
            </div>
          </div>
        </div>
      )}

      {/* Outro Tab */}
      {activeTab === 'outro' && (
        <div className="space-y-4">
          <div>
            <label className="text-white font-semibold mb-2 block">Outro Message</label>
            <textarea
              value={config.outroText}
              onChange={(e) => handleOutroChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-4 text-white focus:outline-none focus:border-purple-500 resize-none h-32"
              placeholder="Enter your outro message..."
            />
            <div className="text-xs text-slate-400 mt-1">
              Character count: {config.outroText.length} / 500
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePlayPreview}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                config.isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {config.isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Stop Preview
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Preview Outro
                </>
              )}
            </button>
            <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold flex items-center gap-2 transition">
              <Mic2 className="w-5 h-5" />
              Record Custom
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="text-slate-300 text-sm">
              <div className="font-semibold mb-2">Preview:</div>
              <div className="italic text-slate-400">"{config.outroText}"</div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Voice Speed */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-semibold">Voice Speed</label>
              <span className="text-purple-400 font-semibold">{config.voiceSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={config.voiceSpeed}
              onChange={(e) => setConfig(prev => ({ ...prev, voiceSpeed: parseFloat(e.target.value) }))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Voice Pitch */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-semibold">Voice Pitch</label>
              <span className="text-cyan-400 font-semibold">{config.voicePitch.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={config.voicePitch}
              onChange={(e) => setConfig(prev => ({ ...prev, voicePitch: parseFloat(e.target.value) }))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>Deep</span>
              <span>Normal</span>
              <span>High</span>
            </div>
          </div>

          {/* Energy Level */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <label className="text-white font-semibold mb-3 block">Energy Level</label>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setConfig(prev => ({ ...prev, energy: level }))}
                  className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${
                    config.energy === level
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {level === 'low' ? '🔇' : level === 'medium' ? '🔉' : '🔊'} {level}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Intro/Outro */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <label className="text-white font-semibold mb-3 block flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              Auto-play Intro at Start
            </label>
            <label className="text-white font-semibold flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              Auto-play Outro at End
            </label>
          </div>

          {/* Save Settings */}
          <button className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition">
            Save Settings
          </button>
        </div>
      )}

      {/* Active DJ Status */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{currentDJ.icon}</div>
          <div>
            <div className="text-white font-semibold">{currentDJ.name} is Ready</div>
            <div className="text-purple-300 text-sm">Your AI DJ will automatically introduce and close out your performances</div>
          </div>
        </div>
        <div className="text-green-400 font-semibold">● ACTIVE</div>
      </div>
    </div>
  );
};
