import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Minimize2, Maximize2, Hand, Volume2, VolumeX, Settings } from 'lucide-react';

// ASL fingerspelling hand shapes mapped to letters
const ASL_HAND_SHAPES: Record<string, string> = {
  a: '✊', b: '🖐', c: '🤏', d: '☝️', e: '✊', f: '👌',
  g: '🤙', h: '🤞', i: '🤙', j: '🤙', k: '✌️', l: '🤟',
  m: '✊', n: '✊', o: '👌', p: '👇', q: '👇', r: '🤞',
  s: '✊', t: '✊', u: '✌️', v: '✌️', w: '🤟', x: '☝️',
  y: '🤙', z: '☝️', ' ': '  ',
};

// Common ASL signs for frequently used words
const ASL_WORD_SIGNS: Record<string, { emoji: string; motion: string }> = {
  hello: { emoji: '👋', motion: 'wave' },
  goodbye: { emoji: '👋', motion: 'wave-slow' },
  yes: { emoji: '✊', motion: 'nod' },
  no: { emoji: '✌️', motion: 'shake' },
  please: { emoji: '🤲', motion: 'circle-chest' },
  'thank you': { emoji: '🤲', motion: 'chin-forward' },
  thanks: { emoji: '🤲', motion: 'chin-forward' },
  help: { emoji: '👍', motion: 'lift' },
  sorry: { emoji: '✊', motion: 'circle-chest' },
  love: { emoji: '🤟', motion: 'hold' },
  good: { emoji: '👍', motion: 'chin-forward' },
  bad: { emoji: '👎', motion: 'chin-down' },
  welcome: { emoji: '🤲', motion: 'open-forward' },
  understand: { emoji: '☝️', motion: 'snap-up' },
  question: { emoji: '☝️', motion: 'curl' },
  stop: { emoji: '🖐', motion: 'push' },
  go: { emoji: '👉', motion: 'point-forward' },
  come: { emoji: '🤏', motion: 'beckon' },
  wait: { emoji: '🖐', motion: 'hold' },
  name: { emoji: '✌️', motion: 'tap' },
  what: { emoji: '🤷', motion: 'shrug' },
  where: { emoji: '☝️', motion: 'wag' },
  when: { emoji: '☝️', motion: 'circle' },
  who: { emoji: '👌', motion: 'chin-circle' },
  how: { emoji: '🤲', motion: 'flip' },
  why: { emoji: '🤏', motion: 'forehead-pull' },
  i: { emoji: '☝️', motion: 'point-self' },
  you: { emoji: '👉', motion: 'point-forward' },
  we: { emoji: '☝️', motion: 'arc' },
  they: { emoji: '👉', motion: 'sweep' },
  more: { emoji: '🤏', motion: 'tap-together' },
  want: { emoji: '🤲', motion: 'pull-in' },
  need: { emoji: '☝️', motion: 'bend' },
  can: { emoji: '✊', motion: 'down-together' },
  think: { emoji: '☝️', motion: 'temple-tap' },
  know: { emoji: '🤏', motion: 'temple-tap' },
  see: { emoji: '✌️', motion: 'eyes-forward' },
  hear: { emoji: '☝️', motion: 'ear-point' },
  speak: { emoji: '🤏', motion: 'mouth-forward' },
  work: { emoji: '✊', motion: 'tap-wrist' },
  home: { emoji: '🤏', motion: 'cheek-ear' },
  food: { emoji: '🤏', motion: 'mouth-tap' },
  water: { emoji: '🤟', motion: 'chin-tap' },
  time: { emoji: '☝️', motion: 'wrist-tap' },
  today: { emoji: '🤲', motion: 'down-now' },
  tomorrow: { emoji: '👍', motion: 'cheek-forward' },
  friend: { emoji: '☝️', motion: 'hook-twice' },
  family: { emoji: '👌', motion: 'circle-both' },
};

interface SignLanguageAvatarProps {
  text: string;
  isActive: boolean;
  onClose?: () => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  size?: 'small' | 'medium' | 'large';
}

// Avatar body parts for animation
function AvatarBody({ 
  currentSign, 
  animationPhase, 
  isAnimating 
}: { 
  currentSign: { emoji: string; motion: string; word: string } | null;
  animationPhase: number;
  isAnimating: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background circle
    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(w/2, h/2, w/2 - 4, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.ellipse(w/2, h * 0.85, w * 0.25, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#e8b89d';
    ctx.fillRect(w/2 - 8, h * 0.55, 16, h * 0.15);

    // Head
    ctx.fillStyle = '#e8b89d';
    ctx.beginPath();
    ctx.arc(w/2, h * 0.38, w * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#4a3728';
    ctx.beginPath();
    ctx.arc(w/2, h * 0.32, w * 0.19, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w/2 - w*0.17, h * 0.38, 6, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w/2 + w*0.17, h * 0.38, 6, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.arc(w/2 - 10, h * 0.36, 3, 0, Math.PI * 2);
    ctx.arc(w/2 + 10, h * 0.36, 3, 0, Math.PI * 2);
    ctx.fill();

    // Mouth - slight smile when signing
    ctx.strokeStyle = '#c08070';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (isAnimating) {
      // Open mouth when signing
      ctx.ellipse(w/2, h * 0.44, 6, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.arc(w/2, h * 0.42, 6, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }

    // Arms with animation
    ctx.strokeStyle = '#e8b89d';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    if (isAnimating && currentSign) {
      const phase = animationPhase % 4;
      const motion = currentSign.motion;

      // Left arm
      ctx.beginPath();
      ctx.moveTo(w/2 - w*0.2, h * 0.7);
      if (motion === 'wave' || motion === 'wave-slow') {
        const swing = Math.sin(phase * Math.PI / 2) * 15;
        ctx.quadraticCurveTo(w*0.15, h*0.4, w*0.2 + swing, h*0.25);
      } else if (motion === 'circle-chest' || motion === 'circle') {
        const cx = Math.cos(phase * Math.PI / 2) * 10;
        const cy = Math.sin(phase * Math.PI / 2) * 10;
        ctx.quadraticCurveTo(w*0.2, h*0.5, w*0.3 + cx, h*0.45 + cy);
      } else if (motion === 'nod' || motion === 'hold') {
        ctx.quadraticCurveTo(w*0.2, h*0.5, w*0.3, h*0.4);
      } else {
        const bob = Math.sin(phase * Math.PI / 2) * 8;
        ctx.quadraticCurveTo(w*0.2, h*0.5, w*0.25, h*0.38 + bob);
      }
      ctx.stroke();

      // Right arm
      ctx.beginPath();
      ctx.moveTo(w/2 + w*0.2, h * 0.7);
      if (motion === 'wave' || motion === 'wave-slow') {
        const swing = Math.sin((phase + 1) * Math.PI / 2) * 15;
        ctx.quadraticCurveTo(w*0.85, h*0.4, w*0.8 + swing, h*0.25);
      } else if (motion === 'tap' || motion === 'tap-together') {
        const tap = phase % 2 === 0 ? -5 : 5;
        ctx.quadraticCurveTo(w*0.8, h*0.5, w*0.7, h*0.4 + tap);
      } else if (motion === 'push' || motion === 'point-forward') {
        const push = phase * 3;
        ctx.quadraticCurveTo(w*0.8, h*0.5, w*0.75 + push, h*0.4);
      } else {
        const bob = Math.cos(phase * Math.PI / 2) * 8;
        ctx.quadraticCurveTo(w*0.8, h*0.5, w*0.75, h*0.38 + bob);
      }
      ctx.stroke();

      // Hand signs (emoji)
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      if (motion === 'wave' || motion === 'wave-slow') {
        ctx.fillText(currentSign.emoji, w*0.2, h*0.25);
        ctx.fillText(currentSign.emoji, w*0.8, h*0.25);
      } else {
        ctx.fillText(currentSign.emoji, w*0.3, h*0.38);
        ctx.fillText(currentSign.emoji, w*0.7, h*0.38);
      }
    } else {
      // Resting arms
      ctx.beginPath();
      ctx.moveTo(w/2 - w*0.2, h * 0.7);
      ctx.quadraticCurveTo(w*0.2, h*0.75, w*0.22, h*0.85);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w/2 + w*0.2, h * 0.7);
      ctx.quadraticCurveTo(w*0.8, h*0.75, w*0.78, h*0.85);
      ctx.stroke();
    }

  }, [currentSign, animationPhase, isAnimating]);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={200}
      className="mx-auto"
    />
  );
}

export default function SignLanguageAvatar({
  text,
  isActive,
  onClose,
  position = 'bottom-right',
  size = 'medium',
}: SignLanguageAvatarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSign, setCurrentSign] = useState<{ emoji: string; motion: string; word: string } | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [signQueue, setSignQueue] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [showFingerSpell, setShowFingerSpell] = useState(false);
  const [fingerSpellIndex, setFingerSpellIndex] = useState(0);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [showSettings, setShowSettings] = useState(false);
  const animFrameRef = useRef<number>(0);
  const signTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const speedMs = speed === 'slow' ? 1200 : speed === 'fast' ? 400 : 700;

  // Parse text into sign queue when new text arrives
  useEffect(() => {
    if (!text || !isActive) return;

    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    setSignQueue(words);
  }, [text, isActive]);

  // Process sign queue
  useEffect(() => {
    if (signQueue.length === 0 || !isActive) {
      setIsAnimating(false);
      setCurrentSign(null);
      setCurrentWord('');
      return;
    }

    const processNext = () => {
      const word = signQueue[0];
      setCurrentWord(word);

      // Check for known ASL word signs first
      const knownSign = ASL_WORD_SIGNS[word];
      if (knownSign) {
        setCurrentSign({ ...knownSign, word });
        setIsAnimating(true);
        setShowFingerSpell(false);

        signTimeoutRef.current = setTimeout(() => {
          setSignQueue(prev => prev.slice(1));
        }, speedMs);
      } else {
        // Fingerspell unknown words
        setShowFingerSpell(true);
        setFingerSpellIndex(0);
        setIsAnimating(true);

        const spellWord = (index: number) => {
          if (index >= word.length) {
            setShowFingerSpell(false);
            setSignQueue(prev => prev.slice(1));
            return;
          }
          const letter = word[index];
          const handShape = ASL_HAND_SHAPES[letter] || '✊';
          setCurrentSign({ emoji: handShape, motion: 'hold', word: letter.toUpperCase() });
          setFingerSpellIndex(index);
          signTimeoutRef.current = setTimeout(() => spellWord(index + 1), speedMs * 0.5);
        };
        spellWord(0);
      }
    };

    processNext();

    return () => {
      if (signTimeoutRef.current) clearTimeout(signTimeoutRef.current);
    };
  }, [signQueue, isActive, speedMs]);

  // Animation loop for smooth arm movements
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => prev + 1);
    }, 250);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-16 left-4',
    'top-right': 'top-16 right-4',
  };

  const sizeClasses = {
    small: 'w-48',
    medium: 'w-56',
    large: 'w-72',
  };

  if (!isActive) return null;

  return (
    <div
      className={`fixed ${positionClasses[position]} ${sizeClasses[size]} z-50 select-none`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="bg-gray-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-indigo-600/20 border-b border-indigo-500/20">
          <div className="flex items-center gap-2">
            <Hand className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300">ASL Interpreter</span>
            {isAnimating && (
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-white/40 hover:text-white/80 p-1 rounded"
              title="Settings"
            >
              <Settings className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white/40 hover:text-white/80 p-1 rounded"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/40 hover:text-red-400 p-1 rounded"
                title="Close"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && !isMinimized && (
          <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Speed:</span>
              <div className="flex gap-1">
                {(['slow', 'normal', 'fast'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      speed === s ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isMinimized && (
          <>
            {/* Avatar Display */}
            <div className="relative px-2 pt-2">
              <AvatarBody
                currentSign={currentSign}
                animationPhase={animationPhase}
                isAnimating={isAnimating}
              />

              {/* Current word overlay */}
              {currentWord && isAnimating && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/70 rounded-lg px-3 py-1">
                  <span className="text-xs font-mono text-indigo-300">
                    {showFingerSpell ? (
                      <>
                        {currentWord.split('').map((letter, i) => (
                          <span
                            key={i}
                            className={`${i === fingerSpellIndex ? 'text-yellow-400 font-bold text-sm' : 'text-gray-400'}`}
                          >
                            {letter.toUpperCase()}
                          </span>
                        ))}
                      </>
                    ) : (
                      <span className="text-indigo-300">{currentWord}</span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Sign info bar */}
            <div className="px-3 py-2 border-t border-gray-800/50">
              {isAnimating && currentSign ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentSign.emoji}</span>
                    <div>
                      <p className="text-[10px] text-gray-400">
                        {showFingerSpell ? 'Fingerspelling' : 'ASL Sign'}
                      </p>
                      <p className="text-xs text-white font-medium">{currentSign.word}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">{signQueue.length} words left</p>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 text-center">
                  Waiting for speech input...
                </p>
              )}
            </div>

            {/* Accessibility note */}
            <div className="px-3 py-1.5 bg-indigo-900/20 border-t border-indigo-500/10">
              <p className="text-[9px] text-indigo-400/60 text-center">
                AI-assisted ASL visualization — not a certified interpreter
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
