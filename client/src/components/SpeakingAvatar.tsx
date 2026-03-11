/**
 * SpeakingAvatar
 * 
 * Animated avatar component for AI personas (Valanna, Candy, Seraph).
 * Shows a pulsing ring and sound wave animation when the persona is speaking.
 * Cross-platform — usable in chat, conference, sidebar, and any panel.
 */

import type { AiPersona } from '@/services/aiVoiceTts';

interface SpeakingAvatarProps {
  persona: AiPersona;
  isSpeaking: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const PERSONA_CONFIG: Record<AiPersona, {
  initials: string;
  displayName: string;
  color: string;
  bgGradient: string;
  ringColor: string;
}> = {
  valanna: {
    initials: 'V',
    displayName: 'Valanna',
    color: '#a78bfa',
    bgGradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    ringColor: 'rgba(167, 139, 250, 0.6)',
  },
  candy: {
    initials: 'C',
    displayName: 'Candy',
    color: '#60a5fa',
    bgGradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
    ringColor: 'rgba(96, 165, 250, 0.6)',
  },
  seraph: {
    initials: 'S',
    displayName: 'Seraph',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    ringColor: 'rgba(245, 158, 11, 0.6)',
  },
};

const SIZE_CONFIG = {
  xs: { container: 20, font: 9, ring: 24, bars: 3, barWidth: 1.5, barHeight: 6 },
  sm: { container: 28, font: 11, ring: 34, bars: 4, barWidth: 2, barHeight: 8 },
  md: { container: 40, font: 15, ring: 48, bars: 5, barWidth: 2.5, barHeight: 12 },
  lg: { container: 56, font: 20, ring: 66, bars: 5, barWidth: 3, barHeight: 16 },
};

export function SpeakingAvatar({ persona, isSpeaking, size = 'md', showLabel = false, className = '' }: SpeakingAvatarProps) {
  const config = PERSONA_CONFIG[persona];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="relative shrink-0" style={{ width: sizeConfig.ring, height: sizeConfig.ring }}>
        {/* Pulsing ring when speaking */}
        {isSpeaking && (
          <>
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                backgroundColor: config.ringColor,
                opacity: 0.3,
                animationDuration: '1.5s',
              }}
            />
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                border: `2px solid ${config.color}`,
                opacity: 0.5,
                animationDuration: '1s',
              }}
            />
          </>
        )}

        {/* Avatar circle */}
        <div
          className="absolute rounded-full flex items-center justify-center shadow-lg"
          style={{
            width: sizeConfig.container,
            height: sizeConfig.container,
            top: (sizeConfig.ring - sizeConfig.container) / 2,
            left: (sizeConfig.ring - sizeConfig.container) / 2,
            background: config.bgGradient,
            border: isSpeaking ? `2px solid ${config.color}` : '2px solid transparent',
            transition: 'border-color 0.3s ease',
          }}
        >
          <span
            className="font-bold text-white select-none"
            style={{ fontSize: sizeConfig.font }}
          >
            {config.initials}
          </span>
        </div>

        {/* Sound wave bars when speaking */}
        {isSpeaking && (
          <div
            className="absolute flex items-end gap-px"
            style={{
              bottom: -2,
              right: -2,
              height: sizeConfig.barHeight,
            }}
          >
            {Array.from({ length: sizeConfig.bars }).map((_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: sizeConfig.barWidth,
                  backgroundColor: config.color,
                  height: '100%',
                  animation: `speakingBar 0.6s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-white font-medium" style={{ fontSize: sizeConfig.font }}>
            {config.displayName}
          </span>
          {isSpeaking && (
            <span className="text-[9px] animate-pulse" style={{ color: config.color }}>
              Speaking...
            </span>
          )}
        </div>
      )}

      {/* CSS animation for sound bars */}
      <style>{`
        @keyframes speakingBar {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

export default SpeakingAvatar;
