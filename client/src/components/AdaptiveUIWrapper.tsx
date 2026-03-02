import React, { ReactNode } from 'react';
import { useUserCapability, CapabilityLevel } from '@/hooks/useUserCapability';
import { HelpCircle } from 'lucide-react';

interface AdaptiveUIWrapperProps {
  children: ReactNode;
  requiredLevel?: CapabilityLevel;
  fallback?: ReactNode;
  tooltip?: string;
  className?: string;
}

/**
 * Adaptive UI Wrapper Component
 * Shows content only if user capability level meets requirement
 * Provides helpful tooltips for beginners
 */
export const AdaptiveUIWrapper: React.FC<AdaptiveUIWrapperProps> = ({
  children,
  requiredLevel = 'beginner',
  fallback = null,
  tooltip,
  className = '',
}) => {
  const { profile, shouldShowFeature } = useUserCapability();
  const [showTooltip, setShowTooltip] = React.useState(false);

  if (!shouldShowFeature(requiredLevel)) {
    return fallback as React.ReactElement;
  }

  return (
    <div className={className} title={tooltip}>
      {children}
      {tooltip && profile.level === 'beginner' && (
        <div className="relative inline-block ml-2">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-900 text-slate-100 text-xs rounded-lg whitespace-nowrap border border-slate-700 z-50">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-700" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ProgressiveDisclosureProps {
  children: ReactNode;
  className?: string;
}

/**
 * Progressive Disclosure Component
 * Gradually reveals advanced features as user capability increases
 */
export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  children,
  className = '',
}) => {
  const { profile } = useUserCapability();
  const [expanded, setExpanded] = React.useState(profile.level !== 'beginner');

  return (
    <div className={className}>
      {expanded ? (
        children
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          <span>✨ Show advanced options</span>
        </button>
      )}
    </div>
  );
};

interface GuidedModeProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  instruction: string;
  onNext?: () => void;
  onSkip?: () => void;
}

/**
 * Guided Mode Component
 * Shows step-by-step instructions for beginners
 */
export const GuidedMode: React.FC<GuidedModeProps> = ({
  children,
  step,
  totalSteps,
  instruction,
  onNext,
  onSkip,
}) => {
  const { profile } = useUserCapability();

  if (profile.level !== 'beginner') {
    return children as React.ReactElement;
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute -bottom-24 left-0 right-0 p-4 bg-gradient-to-r from-blue-900/80 to-purple-900/80 rounded-lg border-2 border-blue-500/50 backdrop-blur-sm z-50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-300 mb-1">
              Step {step} of {totalSteps}
            </p>
            <p className="text-sm text-slate-200">{instruction}</p>
          </div>
          <div className="flex gap-2">
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors"
              >
                Skip
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

interface CapabilityLevelIndicatorProps {
  className?: string;
}

/**
 * Capability Level Indicator Component
 * Shows current user capability level with option to change
 */
export const CapabilityLevelIndicator: React.FC<CapabilityLevelIndicatorProps> = ({
  className = '',
}) => {
  const { profile, setCapabilityLevel } = useUserCapability();
  const [showMenu, setShowMenu] = React.useState(false);

  const levelColors = {
    beginner: 'bg-green-500/20 text-green-400',
    intermediate: 'bg-blue-500/20 text-blue-400',
    advanced: 'bg-purple-500/20 text-purple-400',
    operator: 'bg-red-500/20 text-red-400',
  };

  const levelLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    operator: 'Operator',
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${levelColors[profile.level]}`}
      >
        {levelLabels[profile.level]} ({profile.confidence}%)
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 min-w-max">
          {Object.entries(levelLabels).map(([level, label]) => (
            <button
              key={level}
              onClick={() => {
                setCapabilityLevel(level as CapabilityLevel);
                setShowMenu(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                profile.level === level
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
