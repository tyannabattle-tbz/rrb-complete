import { useState, useEffect } from 'react';
import { Volume2, Wifi, TrendingDown, Clock } from 'lucide-react';
import {
  QUALITY_OPTIONS,
  getQualityOption,
  getAllQualityOptions,
  calculateDataUsage,
  formatDataUsage,
  estimateStreamingTime,
  detectNetworkSpeed,
  saveQualityPreference,
  loadQualityPreference
} from '@/lib/streamQualityService';
import { useAuth } from '@/_core/hooks/useAuth';

interface QualitySelectorWidgetProps {
  onQualityChange?: (quality: 'low' | 'medium' | 'high' | 'lossless') => void;
  compact?: boolean;
}

export function QualitySelectorWidget({ onQualityChange, compact = false }: QualitySelectorWidgetProps) {
  const { user } = useAuth();
  const [selectedQuality, setSelectedQuality] = useState<'low' | 'medium' | 'high' | 'lossless'>('medium');
  const [detectedQuality, setDetectedQuality] = useState<'low' | 'medium' | 'high' | 'lossless' | null>(null);
  const [autoQuality, setAutoQuality] = useState(false);
  const [availableBandwidth, setAvailableBandwidth] = useState(100);

  // Load user preference on mount
  useEffect(() => {
    if (user?.id) {
      const preference = loadQualityPreference(user.id);
      if (preference) {
        setSelectedQuality(preference.preferredQuality);
        setAutoQuality(preference.autoQuality);
      }
    }

    // Detect network speed
    detectNetworkSpeed().then(quality => {
      setDetectedQuality(quality);
      if (autoQuality) {
        setSelectedQuality(quality);
      }
    });
  }, [user?.id, autoQuality]);

  const handleQualityChange = (quality: 'low' | 'medium' | 'high' | 'lossless') => {
    setSelectedQuality(quality);
    setAutoQuality(false);

    if (user?.id) {
      saveQualityPreference({
        userId: user.id,
        preferredQuality: quality,
        autoQuality: false,
        maxBandwidth: availableBandwidth,
        lastUpdated: Date.now()
      });
    }

    onQualityChange?.(quality);
  };

  const handleAutoQuality = () => {
    const newAutoQuality = !autoQuality;
    setAutoQuality(newAutoQuality);

    if (newAutoQuality && detectedQuality) {
      setSelectedQuality(detectedQuality);
    }

    if (user?.id) {
      saveQualityPreference({
        userId: user.id,
        preferredQuality: selectedQuality,
        autoQuality: newAutoQuality,
        maxBandwidth: availableBandwidth,
        lastUpdated: Date.now()
      });
    }
  };

  const currentOption = getQualityOption(selectedQuality);
  const dataUsage = calculateDataUsage(selectedQuality, 60);
  const streamingTime = estimateStreamingTime(selectedQuality, 500); // 500MB available

  if (compact) {
    return (
      <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm text-slate-900">Audio Quality</span>
          </div>
          <button
            onClick={handleAutoQuality}
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
              autoQuality
                ? 'bg-green-200 text-green-700'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            {autoQuality ? '✓ Auto' : 'Manual'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {getAllQualityOptions().map(option => (
            <button
              key={option.id}
              onClick={() => handleQualityChange(option.id)}
              className={`p-2 rounded-lg text-xs font-medium transition-all ${
                selectedQuality === option.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {option.label.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="mt-3 text-xs text-slate-600 space-y-1">
          <p>💾 {formatDataUsage(dataUsage)}/hour</p>
          <p>⏱️ {streamingTime.hours}h {streamingTime.minutes}m with 500MB</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-blue-600" />
            Audio Quality Settings
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Choose your preferred audio quality based on your bandwidth and device
          </p>
        </div>
        <button
          onClick={handleAutoQuality}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            autoQuality
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          {autoQuality ? '✓ Auto Quality' : 'Manual Mode'}
        </button>
      </div>

      {/* Detected Quality */}
      {detectedQuality && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-900">
            Detected network quality: <strong>{detectedQuality.toUpperCase()}</strong>
          </span>
        </div>
      )}

      {/* Quality Options Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {getAllQualityOptions().map(option => {
          const isSelected = selectedQuality === option.id;
          const usage = calculateDataUsage(option.id, 60);
          const streaming = estimateStreamingTime(option.id, 500);

          return (
            <button
              key={option.id}
              onClick={() => handleQualityChange(option.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900">{option.label}</h4>
                  <p className="text-xs text-slate-600">{option.codec}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-slate-700 mb-3">{option.description}</p>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3 h-3" />
                  <span>{option.bitrate} kbps • {option.sampleRate / 1000}kHz</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-3 h-3" />
                  <span>{formatDataUsage(usage)}/hour</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{streaming.hours}h {streaming.minutes}m with 500MB</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bandwidth Slider */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
        <label className="block text-sm font-medium text-slate-900 mb-2">
          Available Bandwidth: {availableBandwidth} Mbps
        </label>
        <input
          type="range"
          min="10"
          max="1000"
          value={availableBandwidth}
          onChange={e => setAvailableBandwidth(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-slate-600 mt-2">
          Adjust this to match your internet speed for accurate recommendations
        </p>
      </div>

      {/* Current Selection Summary */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <h4 className="font-bold mb-2">Current Selection</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="opacity-90">Quality</p>
            <p className="font-bold text-lg">{selectedQuality.toUpperCase()}</p>
          </div>
          <div>
            <p className="opacity-90">Bitrate</p>
            <p className="font-bold text-lg">{currentOption.bitrate} kbps</p>
          </div>
          <div>
            <p className="opacity-90">Data/Hour</p>
            <p className="font-bold">{formatDataUsage(dataUsage)}</p>
          </div>
          <div>
            <p className="opacity-90">Streaming Time</p>
            <p className="font-bold">{streamingTime.hours}h {streamingTime.minutes}m</p>
          </div>
        </div>
      </div>
    </div>
  );
}
