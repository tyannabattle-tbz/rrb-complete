import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';
import { Download, Volume2, RotateCcw, Trophy, BookOpen, Users, Sparkles, ChevronDown, ChevronUp, Bot, UserPlus, Swords, Zap, Palette, Upload, Image as ImageIcon, Plus, Minus, Crown, Settings2 } from 'lucide-react';

// Dice skin definitions
type DiceSkin = 'classic' | 'gold' | 'neon' | 'wood' | 'crystal' | 'fire' | 'custom';
const DICE_SKINS: { id: DiceSkin; name: string; bg: string; dot: string; border: string; desc: string }[] = [
  { id: 'classic', name: 'Classic', bg: '#1a1a2e', dot: '#fbbf24', border: '#a78bfa', desc: 'Original purple & gold' },
  { id: 'gold', name: 'Gold Rush', bg: '#2d1f0e', dot: '#ffd700', border: '#daa520', desc: 'Solid gold luxury' },
  { id: 'neon', name: 'Neon Glow', bg: '#0a0a1a', dot: '#00ff88', border: '#00ff88', desc: 'Electric green glow' },
  { id: 'wood', name: 'Heritage', bg: '#3e2723', dot: '#ffcc80', border: '#8d6e63', desc: 'Warm wood grain' },
  { id: 'crystal', name: 'Crystal', bg: '#0d1b2a', dot: '#e0f7fa', border: '#4dd0e1', desc: 'Ice blue crystal' },
  { id: 'fire', name: 'Fire', bg: '#1a0000', dot: '#ff6b35', border: '#ff4500', desc: 'Blazing hot dice' },
  { id: 'custom', name: 'Custom', bg: '#1a1a2e', dot: '#fbbf24', border: '#a78bfa', desc: 'Upload your own images' },
];

// ============================================================
// SOLBONES 4+3+2 DICE GAME
// Sacred Math, Frequency, and Joy for the Solbone Nation
// Based on the official Solbones 4+3+2 Dice Rulebook
// A Canryn Production
// ============================================================

// Full Solfeggio frequency set (9 frequencies)
const ALL_FREQUENCIES = [
  { frequency: 174, note: 'UT', name: 'Foundation', color: 'text-red-400', bgColor: 'from-red-600 to-red-800', description: 'Foundation and security, natural pain relief' },
  { frequency: 285, note: 'RE', name: 'Restoration', color: 'text-orange-400', bgColor: 'from-orange-600 to-orange-800', description: 'Tissue repair and cellular healing' },
  { frequency: 396, note: 'MI', name: 'Liberation', color: 'text-yellow-400', bgColor: 'from-yellow-600 to-yellow-800', description: 'Liberates guilt and fear, turns grief into joy' },
  { frequency: 432, note: 'FA', name: 'Drop Radio', color: 'text-amber-400', bgColor: 'from-amber-600 to-amber-800', description: 'Universal harmony, Schumann Resonance of Earth' },
  { frequency: 528, note: 'SOL', name: 'Love / Miracles', color: 'text-green-400', bgColor: 'from-green-600 to-green-800', description: 'DNA repair, love frequency, miracle tone' },
  { frequency: 639, note: 'LA', name: 'Connection', color: 'text-teal-400', bgColor: 'from-teal-600 to-teal-800', description: 'Harmonious relationships and communication' },
  { frequency: 741, note: 'TI', name: 'Expression', color: 'text-blue-400', bgColor: 'from-blue-600 to-blue-800', description: 'Awakening intuition, cleansing toxins' },
  { frequency: 852, note: 'DO', name: 'Intuition', color: 'text-indigo-400', bgColor: 'from-indigo-600 to-indigo-800', description: 'Spiritual order, seeing through illusions' },
  { frequency: 963, note: 'OM', name: 'Divine', color: 'text-purple-400', bgColor: 'from-purple-600 to-purple-800', description: 'Frequency of the Gods, return to oneness' },
];

// Die face to frequency mapping (6 faces = first 6 Solfeggio)
const FREQUENCY_MAP: Record<number, typeof ALL_FREQUENCIES[0]> = {
  1: ALL_FREQUENCIES[0], // 174 Hz
  2: ALL_FREQUENCIES[1], // 285 Hz
  3: ALL_FREQUENCIES[2], // 396 Hz
  4: ALL_FREQUENCIES[3], // 432 Hz
  5: ALL_FREQUENCIES[4], // 528 Hz
  6: ALL_FREQUENCIES[5], // 639 Hz
};

// Frequency dice colors per rulebook: red (2), purple (3), blue (4)
const FREQ_DICE: Record<number, string> = { 2: 'red', 3: 'purple', 4: 'blue' };

// Player colors for up to 9 players
const PLAYER_COLORS = [
  { bg: 'from-purple-600 to-purple-800', border: 'border-purple-400', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
  { bg: 'from-cyan-600 to-cyan-800', border: 'border-cyan-400', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
  { bg: 'from-amber-600 to-amber-800', border: 'border-amber-400', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
  { bg: 'from-green-600 to-green-800', border: 'border-green-400', text: 'text-green-400', glow: 'shadow-green-500/20' },
  { bg: 'from-red-600 to-red-800', border: 'border-red-400', text: 'text-red-400', glow: 'shadow-red-500/20' },
  { bg: 'from-blue-600 to-blue-800', border: 'border-blue-400', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  { bg: 'from-pink-600 to-pink-800', border: 'border-pink-400', text: 'text-pink-400', glow: 'shadow-pink-500/20' },
  { bg: 'from-indigo-600 to-indigo-800', border: 'border-indigo-400', text: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
  { bg: 'from-yellow-600 to-yellow-800', border: 'border-yellow-400', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
];

// Die face SVG component
function DieFace({ value, isRolling, size = 80, freqHighlight = false, label, skin = 'classic', customImages }: { value: number; isRolling: boolean; size?: number; freqHighlight?: boolean; label?: string; skin?: DiceSkin; customImages?: Record<number, string> }) {
  const dotPositions: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[30, 30], [70, 70]],
    3: [[30, 30], [50, 50], [70, 70]],
    4: [[30, 30], [70, 30], [30, 70], [70, 70]],
    5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
    6: [[30, 25], [70, 25], [30, 50], [70, 50], [30, 75], [70, 75]],
  };

  const isFreqDie = FREQ_DICE[value] !== undefined;
  const freqColor = isFreqDie ? (value === 2 ? '#ef4444' : value === 3 ? '#a855f7' : '#3b82f6') : undefined;
  const skinDef = DICE_SKINS.find(s => s.id === skin) || DICE_SKINS[0];
  const borderColor = isFreqDie && freqHighlight ? freqColor : skinDef.border;
  const bgColor = isFreqDie && freqHighlight ? `${freqColor}22` : skinDef.bg;
  const dotColor = isFreqDie && freqHighlight ? freqColor : skinDef.dot;

  if (skin === 'custom' && customImages && customImages[value]) {
    return (
      <div className="flex flex-col items-center">
        <div className={`relative ${isRolling ? 'animate-bounce' : 'transition-all duration-300'}`}
          style={{ width: size, height: size }}>
          <img src={customImages[value]} alt={`Die face ${value}`}
            className="w-full h-full object-cover rounded-2xl border-2"
            style={{ borderColor: skinDef.border }} />
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs font-bold rounded px-1">{value}</div>
        </div>
        {label && <span className="text-xs text-purple-400 mt-1">{label}</span>}
        {!isRolling && FREQ_DICE[value] && freqHighlight && (
          <span className="text-xs text-purple-300 mt-0.5">{FREQUENCY_MAP[value]?.note} {FREQUENCY_MAP[value]?.frequency}Hz</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 100 100" className={isRolling ? 'animate-bounce' : 'transition-all duration-300'}>
        <rect x="5" y="5" width="90" height="90" rx="15" ry="15"
          fill={bgColor}
          stroke={borderColor} strokeWidth="3" />
        {(dotPositions[value] || []).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="8"
            fill={dotColor} />
        ))}
      </svg>
      {label && <span className="text-xs text-purple-400 mt-1">{label}</span>}
      {!isRolling && FREQ_DICE[value] && freqHighlight && (
        <span className="text-xs text-purple-300 mt-0.5">{FREQUENCY_MAP[value]?.note} {FREQUENCY_MAP[value]?.frequency}Hz</span>
      )}
    </div>
  );
}

// Score a round based on Solbones 4+3+2 rules
function scoreRound(dice: number[]): { points: number; tallies: number; label: string; bonus?: string } {
  const sorted = [...dice].sort();
  const sum = dice.reduce((a, b) => a + b, 0);

  // Zan Zone: 4+3+2 in frequency colors (always first check)
  if (sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 4) {
    return { points: 18, tallies: 2, label: 'Zan Zone!', bonus: '4+3+2 in frequency colors \u2014 18 pts + 2 tallies' };
  }

  // Tribing Up: 3 of a kind
  if (dice[0] === dice[1] && dice[1] === dice[2]) {
    const isFreq = FREQ_DICE[dice[0]] !== undefined;
    return {
      points: isFreq ? dice[0] * 2 : dice[0],
      tallies: 1,
      label: 'Tribing Up!',
      bonus: `Three ${dice[0]}s${isFreq ? ' (freq dice = double!)' : ''} \u2014 +1 tally`,
    };
  }

  // Check for pairs
  if (dice[0] === dice[1] || dice[1] === dice[2] || dice[0] === dice[2]) {
    const pairVal = dice[0] === dice[1] ? dice[0] : dice[1] === dice[2] ? dice[1] : dice[0];
    const isFreqPair = FREQ_DICE[pairVal] !== undefined;
    const pts = isFreqPair ? pairVal * 2 : pairVal;
    return {
      points: pts,
      tallies: 0,
      label: isFreqPair ? 'Vibing Up!' : `Pair of ${pairVal}s`,
      bonus: isFreqPair ? `Frequency pair of ${pairVal}s = double score` : undefined,
    };
  }

  // Straight sequences
  if ((sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3) ||
      (sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 4) ||
      (sorted[0] === 3 && sorted[1] === 4 && sorted[2] === 5) ||
      (sorted[0] === 4 && sorted[1] === 5 && sorted[2] === 6)) {
    return { points: sum, tallies: 0, label: `Sequence ${sorted.join('-')}!`, bonus: `Run of ${sorted.join('-')} = ${sum} pts` };
  }

  // Default: highest die
  const highest = Math.max(...dice);
  return { points: highest, tallies: 0, label: `Highest: ${highest}` };
}

// Advanced "In the 9" check
function checkInTheNine(dice: number[]): boolean {
  return dice.reduce((a, b) => a + b, 0) === 9;
}

// AI opponent logic
function aiDecision(aiScore: number, currentResult: { points: number } | null, rollsUsed: number, maxRolls: number): 'roll' | 'keep' {
  if (!currentResult) return 'roll';
  if (rollsUsed >= maxRolls) return 'keep';
  if (currentResult.points >= 8) return 'keep';
  if (currentResult.points >= 5 && rollsUsed >= 2) return 'keep';
  if (aiScore >= 55 && currentResult.points >= 3) return 'keep';
  return 'roll';
}

type GameMode = 'standard' | 'advanced' | 'spiral';
type GameState = 'idle' | 'rolling' | 'scored' | 'finished' | 'setup';

interface PlayerState {
  name: string;
  score: number;
  tallies: number;
  isAI: boolean;
}

interface RoundResult {
  dice: number[];
  score: { points: number; tallies: number; label: string; bonus?: string };
  inTheNine: boolean;
  rollNumber: number;
  player: string;
}

// PDF download links
const PDFS = {
  rulebook: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/arqpRyTqdhwFWjWH.pdf',
  tournament: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/oWoPZVaqYMPCXfSf.pdf',
  youth: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/SfHSPxXyvDYnySjZ.pdf',
};

// QUMUS AI personality names
const AI_NAMES = [
  'QUMUS Alpha', 'QUMUS Beta', 'QUMUS Gamma', 'QUMUS Delta',
  'QUMUS Epsilon', 'QUMUS Zeta', 'QUMUS Eta', 'QUMUS Theta', 'QUMUS Iota',
];

export default function Solbones() {
  const { user } = useAuth();

  // Game phase: setup vs playing
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing'>('setup');

  // Setup state
  const [playerCount, setPlayerCount] = useState(2);
  const [setupPlayers, setSetupPlayers] = useState<{ name: string; isAI: boolean }[]>([
    { name: '', isAI: false },
    { name: 'QUMUS AI', isAI: true },
  ]);

  // Game state
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [dice, setDice] = useState<number[]>([1, 1, 1]);
  const [rollsThisRound, setRollsThisRound] = useState(0);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [roundHistory, setRoundHistory] = useState<RoundResult[]>([]);
  const [currentRoundScore, setCurrentRoundScore] = useState<{ points: number; tallies: number; label: string; bonus?: string } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showYouthChallenges, setShowYouthChallenges] = useState(false);
  const [showFrequencies, setShowFrequencies] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [diceSkin, setDiceSkin] = useState<DiceSkin>('classic');
  const [customDiceImages, setCustomDiceImages] = useState<Record<number, string>>({});
  const [showSkins, setShowSkins] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFace, setUploadingFace] = useState<number | null>(null);
  const rollAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // tRPC mutations
  const rollDiceMutation = trpc.solbones.rollDice.useMutation();
  const leaderboardInput = useMemo(() => ({ limit: 10 }), []);
  const leaderboardQuery = trpc.solbones.getLeaderboard.useQuery(leaderboardInput);

  // Win conditions
  const winScore = gameMode === 'standard' ? 63 : gameMode === 'spiral' ? 36 : 63;
  const currentPlayer = players[currentTurnIndex] || { name: 'Player', score: 0, tallies: 0, isAI: false };
  const maxRollsPerRound = currentPlayer.tallies > 0 ? 4 : 3;

  // iOS Safari audio unlock: create AudioContext lazily on first user gesture
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(audioContextRef.current);
        // iOS 17+: Set audio session to 'playback' so Web Audio plays even when mute switch is on
        try {
          if ((navigator as any).audioSession) {
            (navigator as any).audioSession.type = 'playback';
          }
        } catch { /* audioSession not supported */ }
      } catch { /* audio not available */ }
    }
    return audioContextRef.current;
  }, []);

  const unlockAudio = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (audioUnlockedRef.current && ctx.state === 'running') return;

    // Resume suspended context (iOS requires this on user gesture)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Play a silent buffer to fully unlock iOS audio
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      audioUnlockedRef.current = true;
    } catch { /* ignore */ }
  }, [getAudioContext]);

  // GLOBAL touch/pointer unlock: attach to window on mount so ANY first tap unlocks audio
  useEffect(() => {
    const handleFirstTouch = () => {
      const ctx = audioContextRef.current || (() => {
        try {
          const c = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = c;
          setAudioContext(c);
          // iOS 17+: bypass mute switch
          try {
            if ((navigator as any).audioSession) {
              (navigator as any).audioSession.type = 'playback';
            }
          } catch { /* ignore */ }
          return c;
        } catch { return null; }
      })();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        audioUnlockedRef.current = true;
      } catch { /* ignore */ }
      // Remove after first successful unlock
      window.removeEventListener('touchstart', handleFirstTouch, true);
      window.removeEventListener('pointerdown', handleFirstTouch, true);
      window.removeEventListener('mousedown', handleFirstTouch, true);
    };
    window.addEventListener('touchstart', handleFirstTouch, { capture: true, passive: true });
    window.addEventListener('pointerdown', handleFirstTouch, { capture: true, passive: true });
    window.addEventListener('mousedown', handleFirstTouch, { capture: true, passive: true });
    return () => {
      window.removeEventListener('touchstart', handleFirstTouch, true);
      window.removeEventListener('pointerdown', handleFirstTouch, true);
      window.removeEventListener('mousedown', handleFirstTouch, true);
    };
  }, []);

  // Also try to init on mount (works on desktop, won't unlock on iOS until gesture)
  useEffect(() => {
    getAudioContext();
  }, [getAudioContext]);

  // Sync player count with setup players array
  useEffect(() => {
    setSetupPlayers(prev => {
      const newArr = [...prev];
      while (newArr.length < playerCount) {
        const idx = newArr.length;
        newArr.push({ name: `Player ${idx + 1}`, isAI: false });
      }
      return newArr.slice(0, playerCount);
    });
  }, [playerCount]);

  const playFrequency = useCallback((frequency: number, duration = 1.5, volume = 0.15) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      // Always try to resume on each play (iOS needs this)
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch { /* ignore audio errors */ }
  }, [getAudioContext]);

  // Quick chirp for rolling animation
  const playRollingChirp = useCallback((dieValue: number) => {
    const freq = FREQUENCY_MAP[dieValue];
    if (freq) playFrequency(freq.frequency, 0.12, 0.06);
  }, [playFrequency]);

  const startGame = useCallback(() => {
    // Unlock audio on this user gesture (critical for iOS Safari)
    unlockAudio();

    const gamePlayers: PlayerState[] = setupPlayers.map((sp, i) => ({
      name: sp.isAI ? (sp.name || AI_NAMES[i] || `QUMUS AI ${i + 1}`) : (sp.name || user?.name || `Player ${i + 1}`),
      score: 0,
      tallies: 0,
      isAI: sp.isAI,
    }));
    setPlayers(gamePlayers);
    setCurrentTurnIndex(0);
    setGameState('idle');
    setDice([1, 1, 1]);
    setRollsThisRound(0);
    setRoundHistory([]);
    setCurrentRoundScore(null);
    setWinner(null);
    setAiThinking(false);
    setGamePhase('playing');

    // If first player is AI, trigger AI turn after a short delay
    if (gamePlayers[0].isAI) {
      setAiThinking(true);
      aiTimerRef.current = setTimeout(() => {
        setAiThinking(false);
        runAITurnForIndex(0, gamePlayers);
      }, 1200);
    }
  }, [setupPlayers, user?.name, unlockAudio]);

  const performRoll = useCallback((onComplete: (finalDice: number[]) => void) => {
    setIsRolling(true);
    setCurrentRoundScore(null);
    let count = 0;
    if (rollAnimRef.current) clearInterval(rollAnimRef.current);

    // Play the FIRST chirp synchronously (still within user gesture on iOS)
    const firstD1 = Math.floor(Math.random() * 6) + 1;
    const firstD2 = Math.floor(Math.random() * 6) + 1;
    const firstD3 = Math.floor(Math.random() * 6) + 1;
    setDice([firstD1, firstD2, firstD3]);
    playRollingChirp(firstD1);
    count = 1;

    rollAnimRef.current = setInterval(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;
      setDice([d1, d2, d3]);

      // Play rolling chirps every 3rd frame for a musical rolling effect
      if (count % 3 === 0) {
        playRollingChirp(d1);
      }

      count++;
      if (count >= 12) {
        if (rollAnimRef.current) clearInterval(rollAnimRef.current);
        const finalDice = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ];
        setDice(finalDice);
        setIsRolling(false);
        onComplete(finalDice);
      }
    }, 80);
  }, [playRollingChirp]);

  const processRollResult = useCallback((finalDice: number[]) => {
    const result = scoreRound(finalDice);
    const inNine = gameMode === 'advanced' && checkInTheNine(finalDice);

    if (inNine) {
      result.points += 9;
      result.label += ' + In the 9!';
      result.bonus = (result.bonus || '') + ' | Dice total 9 \u2192 +9 bonus';
    }

    setCurrentRoundScore(result);
    setRollsThisRound(prev => prev + 1);
    setGameState('scored');

    const highDie = Math.max(...finalDice);
    const freq = FREQUENCY_MAP[highDie];
    if (freq) playFrequency(freq.frequency);

    // Record to backend if human player
    if (user && !players[currentTurnIndex]?.isAI) {
      rollDiceMutation.mutate({ notes: result.label });
    }

    return result;
  }, [gameMode, playFrequency, user, currentTurnIndex, players, rollDiceMutation]);

  const rollDice = useCallback(() => {
    if (rollsThisRound >= maxRollsPerRound) return;
    if (gameState === 'finished') return;
    if (players[currentTurnIndex]?.isAI) return;

    // Unlock audio on this user gesture (critical for iOS Safari)
    unlockAudio();

    setGameState('rolling');
    performRoll(processRollResult);
  }, [rollsThisRound, maxRollsPerRound, gameState, currentTurnIndex, players, performRoll, processRollResult, unlockAudio]);

  const advanceToNextPlayer = useCallback((currentPlayers: PlayerState[], fromIndex: number) => {
    const nextIndex = (fromIndex + 1) % currentPlayers.length;
    setCurrentTurnIndex(nextIndex);
    setGameState('idle');
    setRollsThisRound(0);
    setCurrentRoundScore(null);

    if (currentPlayers[nextIndex].isAI) {
      setAiThinking(true);
      aiTimerRef.current = setTimeout(() => {
        setAiThinking(false);
        runAITurnForIndex(nextIndex, currentPlayers);
      }, 1200);
    }
  }, []);

  const keepScore = useCallback(() => {
    if (!currentRoundScore) return;

    const turnIdx = currentTurnIndex;
    const newScore = players[turnIdx].score + currentRoundScore.points;
    const newTallies = players[turnIdx].tallies + currentRoundScore.tallies;

    const updatedPlayers = [...players];
    updatedPlayers[turnIdx] = { ...updatedPlayers[turnIdx], score: newScore, tallies: newTallies };
    setPlayers(updatedPlayers);

    setRoundHistory(prev => [...prev, {
      dice: [...dice],
      score: currentRoundScore,
      inTheNine: gameMode === 'advanced' && checkInTheNine(dice),
      rollNumber: prev.length + 1,
      player: players[turnIdx].name,
    }]);

    setRollsThisRound(0);
    setCurrentRoundScore(null);

    if (newScore >= winScore) {
      setGameState('finished');
      setWinner(players[turnIdx].name);
      return;
    }

    advanceToNextPlayer(updatedPlayers, turnIdx);
  }, [currentRoundScore, currentTurnIndex, dice, gameMode, winScore, players, advanceToNextPlayer]);

  // AI turn logic for any player index
  const runAITurnForIndex = useCallback((turnIdx: number, currentPlayers: PlayerState[]) => {
    const aiPlayer = currentPlayers[turnIdx];
    let aiRolls = 0;
    const aiMaxRolls = aiPlayer.tallies > 0 ? 4 : 3;

    const doAIRoll = () => {
      setCurrentTurnIndex(turnIdx);
      setGameState('rolling');

      performRoll((finalDice) => {
        const result = scoreRound(finalDice);
        const inNine = gameMode === 'advanced' && checkInTheNine(finalDice);
        if (inNine) {
          result.points += 9;
          result.label += ' + In the 9!';
        }

        setCurrentRoundScore(result);
        aiRolls++;
        setRollsThisRound(aiRolls);
        setGameState('scored');

        const highDie = Math.max(...finalDice);
        const freq = FREQUENCY_MAP[highDie];
        if (freq) playFrequency(freq.frequency);

        const decision = aiDecision(aiPlayer.score, result, aiRolls, aiMaxRolls);

        setTimeout(() => {
          if (decision === 'keep' || aiRolls >= aiMaxRolls) {
            const newScore = aiPlayer.score + result.points;
            const newTallies = aiPlayer.tallies + result.tallies;

            const updatedPlayers = [...currentPlayers];
            updatedPlayers[turnIdx] = { ...updatedPlayers[turnIdx], score: newScore, tallies: newTallies };
            setPlayers(updatedPlayers);

            setRoundHistory(prev => [...prev, {
              dice: [...finalDice],
              score: result,
              inTheNine: inNine,
              rollNumber: prev.length + 1,
              player: aiPlayer.name,
            }]);

            setRollsThisRound(0);
            setCurrentRoundScore(null);

            if (newScore >= winScore) {
              setGameState('finished');
              setWinner(aiPlayer.name);
            } else {
              // Advance to next player
              const nextIdx = (turnIdx + 1) % updatedPlayers.length;
              setCurrentTurnIndex(nextIdx);
              setGameState('idle');

              if (updatedPlayers[nextIdx].isAI) {
                setAiThinking(true);
                aiTimerRef.current = setTimeout(() => {
                  setAiThinking(false);
                  runAITurnForIndex(nextIdx, updatedPlayers);
                }, 1200);
              }
            }
          } else {
            doAIRoll();
          }
        }, 1000);
      });
    };

    doAIRoll();
  }, [gameMode, winScore, performRoll, playFrequency]);

  const useTally = () => {
    if (currentPlayer.tallies <= 0) return;
    const updatedPlayers = [...players];
    updatedPlayers[currentTurnIndex] = { ...updatedPlayers[currentTurnIndex], tallies: updatedPlayers[currentTurnIndex].tallies - 1 };
    setPlayers(updatedPlayers);
  };

  const resetGame = () => {
    setDice([1, 1, 1]);
    setRollsThisRound(0);
    setCurrentRoundScore(null);
    setRoundHistory([]);
    setGameState('idle');
    setWinner(null);
    setCurrentTurnIndex(0);
    setAiThinking(false);
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    setPlayers(prev => prev.map(p => ({ ...p, score: 0, tallies: 0 })));
  };

  const backToSetup = () => {
    resetGame();
    setGamePhase('setup');
  };

  const isMyTurn = !players[currentTurnIndex]?.isAI;

  // ============================================================
  // SETUP SCREEN
  // ============================================================
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#150530] to-[#0a0118]">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
          <div className="relative max-w-4xl mx-auto px-4 py-8 text-center">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm">&larr; Back to Home</Link>
              <span className="text-purple-600">|</span>
              <Link href="/solbones-classic" className="text-amber-400 hover:text-amber-300 text-sm">Play Solbones Classic &rarr;</Link>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
              Solbones <span className="text-3xl md:text-4xl">4+3+2</span>
            </h1>
            <p className="text-purple-200 text-lg md:text-xl max-w-2xl mx-auto mb-2">
              4+3+2=9 &mdash; Sacred Math, Frequency, and Joy for the Solbone Nation
            </p>

            {/* 4+3+2=9 Visual Explainer */}
            <div className="mt-6 mb-2">
              <div className="inline-flex items-center gap-2 md:gap-4 bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-3 md:px-8 md:py-4 border border-purple-500/30">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg shadow-blue-500/30">4</div>
                  <span className="text-blue-400 text-[10px] md:text-xs mt-1">432 Hz</span>
                </div>
                <span className="text-yellow-400 text-2xl md:text-3xl font-bold">+</span>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg shadow-purple-500/30">3</div>
                  <span className="text-purple-400 text-[10px] md:text-xs mt-1">396 Hz</span>
                </div>
                <span className="text-yellow-400 text-2xl md:text-3xl font-bold">+</span>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg shadow-red-500/30">2</div>
                  <span className="text-red-400 text-[10px] md:text-xs mt-1">528 Hz</span>
                </div>
                <span className="text-yellow-400 text-2xl md:text-3xl font-bold">=</span>
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center text-black font-black text-3xl md:text-4xl shadow-lg shadow-yellow-500/40 ring-2 ring-yellow-400/50">9</div>
                  <span className="text-yellow-400 text-[10px] md:text-xs mt-1 font-semibold">Sacred Code</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Panel */}
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Settings2 className="h-6 w-6 text-yellow-400" />
                Game Setup
              </h2>
              <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-sm px-3 py-1">
                {playerCount} Player{playerCount > 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Player Count */}
            <div className="mb-6">
              <label className="text-purple-200 text-sm font-medium mb-3 block">
                Number of Players (1-9, sacred number: 4+3+2=9)
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPlayerCount(Math.max(1, playerCount - 1))}
                  disabled={playerCount <= 1}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-900/50"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button
                      key={n}
                      onClick={() => setPlayerCount(n)}
                      className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${
                        playerCount === n
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black scale-110 shadow-lg shadow-yellow-500/30'
                          : n === 9
                            ? 'bg-purple-900/50 text-yellow-400 border border-yellow-500/30 hover:bg-purple-800/50'
                            : 'bg-purple-900/30 text-purple-300 border border-purple-500/20 hover:bg-purple-800/40'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPlayerCount(Math.min(9, playerCount + 1))}
                  disabled={playerCount >= 9}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-900/50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {playerCount === 9 && (
                <p className="text-yellow-400/70 text-xs mt-2 italic">
                  9 players &mdash; the sacred number! 4+3+2=9
                </p>
              )}
            </div>

            {/* Player List */}
            <div className="space-y-3 mb-6">
              <label className="text-purple-200 text-sm font-medium block">Players</label>
              {setupPlayers.slice(0, playerCount).map((sp, i) => {
                const color = PLAYER_COLORS[i];
                return (
                  <div key={i} className={`flex items-center gap-3 bg-black/30 rounded-lg p-3 border ${color.border}/30`}>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {sp.isAI ? <Bot className="h-4 w-4" /> : i + 1}
                    </div>
                    <Input
                      value={sp.name}
                      onChange={(e) => {
                        const updated = [...setupPlayers];
                        updated[i] = { ...updated[i], name: e.target.value };
                        setSetupPlayers(updated);
                      }}
                      placeholder={sp.isAI ? AI_NAMES[i] : (i === 0 && user?.name ? user.name : `Player ${i + 1}`)}
                      className="bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-400/50 flex-1"
                    />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs ${sp.isAI ? 'text-cyan-400' : 'text-purple-400/60'}`}>
                        {sp.isAI ? 'AI' : 'Human'}
                      </span>
                      <Switch
                        checked={sp.isAI}
                        onCheckedChange={(checked) => {
                          const updated = [...setupPlayers];
                          updated[i] = {
                            ...updated[i],
                            isAI: checked,
                            name: checked ? (AI_NAMES[i] || `QUMUS AI ${i + 1}`) : (i === 0 && user?.name ? user.name : `Player ${i + 1}`),
                          };
                          setSetupPlayers(updated);
                        }}
                      />
                      <Bot className={`h-4 w-4 ${sp.isAI ? 'text-cyan-400' : 'text-purple-500/30'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Presets */}
            <div className="mb-6">
              <label className="text-purple-200 text-sm font-medium mb-3 block">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPlayerCount(1);
                    setSetupPlayers([{ name: user?.name || '', isAI: false }]);
                  }}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-900/50 gap-1"
                >
                  <Sparkles className="h-3 w-3" /> Solo Practice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPlayerCount(2);
                    setSetupPlayers([
                      { name: user?.name || '', isAI: false },
                      { name: 'QUMUS AI', isAI: true },
                    ]);
                  }}
                  className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/50 gap-1"
                >
                  <Bot className="h-3 w-3" /> vs QUMUS AI
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPlayerCount(2);
                    setSetupPlayers([
                      { name: 'Player 1', isAI: false },
                      { name: 'Player 2', isAI: false },
                    ]);
                  }}
                  className="border-green-500/50 text-green-300 hover:bg-green-900/50 gap-1"
                >
                  <Users className="h-3 w-3" /> 2-Player Local
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPlayerCount(9);
                    const newPlayers = Array.from({ length: 9 }, (_, i) => ({
                      name: i % 2 === 0 ? `Player ${Math.floor(i / 2) + 1}` : AI_NAMES[i],
                      isAI: i % 2 !== 0,
                    }));
                    setSetupPlayers(newPlayers);
                  }}
                  className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-900/50 gap-1"
                >
                  <Crown className="h-3 w-3" /> Sacred 9 (Mixed)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPlayerCount(9);
                    const newPlayers = Array.from({ length: 9 }, (_, i) => ({
                      name: AI_NAMES[i],
                      isAI: true,
                    }));
                    setSetupPlayers(newPlayers);
                  }}
                  className="border-red-500/50 text-red-300 hover:bg-red-900/50 gap-1"
                >
                  <Swords className="h-3 w-3" /> 9 AI Battle Royale
                </Button>
              </div>
            </div>

            {/* Game Mode */}
            <div className="mb-8">
              <label className="text-purple-200 text-sm font-medium mb-3 block">Game Mode</label>
              <div className="flex flex-wrap gap-3">
                {([
                  { mode: 'standard' as GameMode, label: 'Standard (First to 63)', icon: '\uD83C\uDFB2' },
                  { mode: 'advanced' as GameMode, label: 'In the 9 (Advanced)', icon: '\u26A1' },
                  { mode: 'spiral' as GameMode, label: 'Spiral Up/Down (First to 36)', icon: '\uD83C\uDF00' },
                ] as const).map(({ mode, label, icon }) => (
                  <Button
                    key={mode}
                    variant={gameMode === mode ? 'default' : 'outline'}
                    onClick={() => setGameMode(mode)}
                    className={`gap-2 ${gameMode === mode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border-purple-500/50 text-purple-300 hover:bg-purple-900/50'}`}
                  >
                    <span>{icon}</span> {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 text-black font-black text-xl py-6 gap-3 shadow-lg shadow-yellow-500/30"
              size="lg"
            >
              <Sparkles className="h-6 w-6" />
              Start Game &mdash; {playerCount} Player{playerCount > 1 ? 's' : ''}
              <Sparkles className="h-6 w-6" />
            </Button>
          </Card>

          {/* Online & Tournament Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <Link href="/solbones-online">
              <Card className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border-purple-500/30 p-5 cursor-pointer hover:border-purple-400/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Online Multiplayer</h3>
                    <p className="text-purple-400/60 text-xs">Create or join rooms &bull; Play with friends worldwide</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/solbones-tournament">
              <Card className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-yellow-500/30 p-5 cursor-pointer hover:border-yellow-400/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Tournament Brackets</h3>
                    <p className="text-yellow-400/60 text-xs">4/8/9-player elimination &bull; Sacred 9 format</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Leaderboard in Setup */}
          <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6 mt-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Global Leaderboard
            </h2>
            {leaderboardQuery.data && leaderboardQuery.data.length > 0 ? (
              <div className="space-y-2">
                {leaderboardQuery.data.map((entry: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-purple-900/30 rounded px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-purple-400'}`}>
                        #{i + 1}
                      </span>
                      <span className="text-white truncate max-w-[120px]">{entry.username || 'Player'}</span>
                    </div>
                    <span className="text-green-400 font-bold">{entry.score}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-purple-400/60 text-sm text-center py-4">No scores yet. Be the first!</p>
            )}
          </Card>

          {/* Downloads in Setup */}
          <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6 mt-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-green-400" />
              Downloads
            </h2>
            <div className="space-y-3">
              <a href={PDFS.rulebook} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg p-3 transition-colors no-underline">
                <BookOpen className="h-5 w-5 text-purple-400 flex-shrink-0" />
                <div>
                  <div className="text-white text-sm font-medium">Official Rulebook</div>
                  <div className="text-purple-400/60 text-xs">Solbones 4+3+2 Dice Rulebook &amp; Cultural Guide</div>
                </div>
              </a>
              <a href={PDFS.tournament} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg p-3 transition-colors no-underline">
                <Trophy className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="text-white text-sm font-medium">Tournament &amp; Score Sheets</div>
                  <div className="text-purple-400/60 text-xs">Printable brackets and scoring</div>
                </div>
              </a>
              <a href={PDFS.youth} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg p-3 transition-colors no-underline">
                <Sparkles className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="text-white text-sm font-medium">Youth Scroll Challenges</div>
                  <div className="text-purple-400/60 text-xs">Zakar Games Legacy Activation Series</div>
                </div>
              </a>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-purple-400/50 text-sm">
            <p>This game belongs to the Solbone Nation, Amarukhan heritage, and all remnant people who walk in joy and intelligence.</p>
            <p className="mt-1">Laughing is healing. Numbers are sacred. We roll in code.</p>
            <p className="mt-2 text-purple-500/40">A Canryn Production</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // GAME SCREEN
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#150530] to-[#0a0118]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-6 text-center">
          <div className="flex items-center gap-4 mb-3">
            <button onClick={backToSetup} className="text-purple-400 hover:text-purple-300 text-sm">&larr; Back to Setup</button>
            <span className="text-purple-600">|</span>
            <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm">Home</Link>
            <span className="text-purple-600">|</span>
            <Link href="/solbones-classic" className="text-amber-400 hover:text-amber-300 text-sm">Solbones Classic &rarr;</Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Solbones <span className="text-2xl md:text-3xl">4+3+2</span>
          </h1>
          <p className="text-purple-300/70 text-sm">
            {players.length} Player{players.length > 1 ? 's' : ''} &bull; {gameMode === 'standard' ? 'Standard' : gameMode === 'advanced' ? 'In the 9' : 'Spiral'} &bull; First to {winScore}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* Multi-Player Scoreboard */}
        {players.length > 1 && (
          <div className={`grid gap-3 mb-6 ${
            players.length <= 3 ? 'grid-cols-2 md:grid-cols-3' :
            players.length <= 6 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' :
            'grid-cols-3 md:grid-cols-5 lg:grid-cols-9'
          }`}>
            {players.map((p, i) => {
              const color = PLAYER_COLORS[i];
              const isCurrent = currentTurnIndex === i;
              return (
                <Card key={i} className={`p-3 border-2 transition-all ${
                  isCurrent
                    ? `bg-gradient-to-br ${color.bg}/20 ${color.border} shadow-lg ${color.glow}`
                    : 'bg-[#1a0a30]/60 border-purple-500/20'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {p.isAI ? <Bot className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" /> : <Users className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />}
                    <span className="text-white font-bold text-xs truncate">{p.name}</span>
                  </div>
                  {isCurrent && <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full animate-pulse inline-block mb-1">Turn</span>}
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-yellow-400">{p.score}</span>
                    <span className="text-[10px] text-purple-400">/{winScore}</span>
                  </div>
                  {p.tallies > 0 && (
                    <div className="text-[10px] text-green-400">Tallies: {p.tallies}</div>
                  )}
                  {/* Progress bar */}
                  <div className="mt-1 h-1.5 bg-purple-900/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${p.isAI ? 'bg-cyan-500' : 'bg-purple-500'}`}
                      style={{ width: `${Math.min(100, (p.score / winScore) * 100)}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Solo Score Display */}
        {players.length === 1 && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-4 bg-black/40 backdrop-blur-sm rounded-xl px-6 py-3 border border-purple-500/30">
              <span className="text-purple-300">Score</span>
              <span className="text-3xl font-bold text-yellow-400">{players[0]?.score || 0}</span>
              <span className="text-purple-400">/ {winScore}</span>
              {(players[0]?.tallies || 0) > 0 && (
                <span className="text-green-400 text-sm">Tallies: {players[0].tallies}</span>
              )}
            </div>
          </div>
        )}

        {/* AI Thinking Indicator */}
        {aiThinking && (
          <div className="text-center mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-cyan-400">
              <Bot className="h-5 w-5 animate-spin" />
              <span className="font-medium">{currentPlayer.name} is thinking...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dice Area */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {currentPlayer.isAI ? <Bot className="h-5 w-5 text-cyan-400" /> : <Sparkles className="h-5 w-5 text-yellow-400" />}
                  {players.length === 1 ? 'Roll the Bones' : `${currentPlayer.name}'s Turn`}
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-purple-300">Roll {rollsThisRound}/{maxRollsPerRound}</span>
                </div>
              </div>

              {/* Dice Display */}
              <div className="flex justify-center items-center gap-4 md:gap-8 mb-8 py-4">
                {dice.map((d, i) => (
                  <DieFace key={i} value={d} isRolling={isRolling} size={90} freqHighlight={!isRolling} skin={diceSkin} customImages={customDiceImages} />
                ))}
              </div>

              {/* Score Display */}
              {currentRoundScore && !isRolling && (
                <div className={`text-center mb-6 p-4 rounded-lg border ${
                  currentRoundScore.tallies > 0
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-purple-500/10 border-purple-500/30'
                }`}>
                  <div className="text-2xl font-bold text-white mb-1">+{currentRoundScore.points} points</div>
                  <div className="text-lg text-purple-200 font-semibold">{currentRoundScore.label}</div>
                  {currentRoundScore.bonus && <div className="text-purple-400 text-sm mt-1">{currentRoundScore.bonus}</div>}
                  {currentRoundScore.tallies > 0 && (
                    <div className="text-yellow-400 text-sm mt-1">+{currentRoundScore.tallies} tally earned!</div>
                  )}
                </div>
              )}

              {/* Game Over */}
              {gameState === 'finished' && winner && (
                <div className="text-center mb-6 p-6 rounded-lg bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-blue-500/20 border border-yellow-500/30">
                  <div className="text-4xl mb-2">{'\uD83C\uDFC6'}</div>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {winner} Wins!
                  </div>
                  <div className="text-purple-200">
                    {gameMode === 'spiral' ? 'Ascension achieved!' : 'Final Scores:'}
                  </div>
                  {gameMode !== 'spiral' && (
                    <div className="flex flex-wrap justify-center gap-3 mt-3">
                      {players.map((p, i) => (
                        <span key={i} className={`text-sm ${p.name === winner ? 'text-yellow-400 font-bold' : 'text-purple-300'}`}>
                          {p.name}: {p.score}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  onClick={rollDice}
                  disabled={isRolling || gameState === 'finished' || !isMyTurn || aiThinking || (rollsThisRound >= maxRollsPerRound && !currentRoundScore)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 text-lg gap-2"
                  size="lg"
                >
                  {isRolling ? '\uD83C\uDFB2 Rolling...' : aiThinking ? '\uD83E\uDD16 AI Turn...' : gameState === 'idle' ? '\uD83C\uDFB2 Roll Dice' : '\uD83C\uDFB2 Re-Roll'}
                </Button>

                {currentRoundScore && !isRolling && gameState !== 'finished' && isMyTurn && (
                  <Button
                    onClick={keepScore}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6"
                    size="lg"
                  >
                    Keep Score
                  </Button>
                )}

                {currentPlayer.tallies > 0 && rollsThisRound >= 3 && gameState !== 'finished' && isMyTurn && (
                  <Button
                    onClick={useTally}
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                    size="lg"
                  >
                    Use Tally (+1 Roll)
                  </Button>
                )}

                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-900/50 gap-2"
                  size="lg"
                >
                  <RotateCcw className="h-4 w-4" /> New Game
                </Button>

                <Button
                  onClick={backToSetup}
                  variant="outline"
                  className="border-amber-500/50 text-amber-300 hover:bg-amber-900/50 gap-2"
                  size="lg"
                >
                  <Settings2 className="h-4 w-4" /> Setup
                </Button>
              </div>
            </Card>

            {/* Dice Skins Panel */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6">
              <button
                onClick={() => setShowSkins(!showSkins)}
                className="w-full flex items-center justify-between text-left"
              >
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Palette className="h-5 w-5 text-yellow-400" />
                  Dice Skins
                </h2>
                {showSkins ? <ChevronUp className="h-5 w-5 text-yellow-400" /> : <ChevronDown className="h-5 w-5 text-yellow-400" />}
              </button>

              {showSkins && (
                <div className="mt-4">
                  <p className="text-purple-300/80 text-sm mb-4">Choose a dice style or upload your own images for each face.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                    {DICE_SKINS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setDiceSkin(s.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          diceSkin === s.id
                            ? 'border-yellow-400 bg-yellow-400/10 scale-105'
                            : 'border-purple-500/30 hover:border-purple-400/50 bg-black/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <svg width="32" height="32" viewBox="0 0 100 100">
                            <rect x="5" y="5" width="90" height="90" rx="15" ry="15" fill={s.bg} stroke={s.border} strokeWidth="4" />
                            <circle cx="30" cy="30" r="8" fill={s.dot} />
                            <circle cx="70" cy="30" r="8" fill={s.dot} />
                            <circle cx="50" cy="50" r="8" fill={s.dot} />
                            <circle cx="30" cy="70" r="8" fill={s.dot} />
                            <circle cx="70" cy="70" r="8" fill={s.dot} />
                          </svg>
                          <div>
                            <div className="text-white font-semibold text-sm">{s.name}</div>
                            <div className="text-purple-400 text-xs">{s.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Image Upload */}
                  {diceSkin === 'custom' && (
                    <div className="border border-purple-500/30 rounded-lg p-4 bg-black/20">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Upload Custom Dice Faces
                      </h3>
                      <p className="text-purple-300/70 text-xs mb-3">Upload an image for each die face (1-6). Images are stored locally in your browser.</p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((face) => (
                          <div key={face} className="flex flex-col items-center">
                            <button
                              onClick={() => {
                                setUploadingFace(face);
                                fileInputRef.current?.click();
                              }}
                              className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center transition-all hover:border-yellow-400 ${
                                customDiceImages[face] ? 'border-green-500 p-0 overflow-hidden' : 'border-purple-500/50'
                              }`}
                            >
                              {customDiceImages[face] ? (
                                <img src={customDiceImages[face]} alt={`Face ${face}`} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-purple-400" />
                              )}
                            </button>
                            <span className="text-xs text-purple-300 mt-1">Face {face}</span>
                          </div>
                        ))}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && uploadingFace) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const dataUrl = ev.target?.result as string;
                              setCustomDiceImages(prev => ({ ...prev, [uploadingFace!]: dataUrl }));
                              setUploadingFace(null);
                            };
                            reader.readAsDataURL(file);
                          }
                          e.target.value = '';
                        }}
                      />
                      {Object.keys(customDiceImages).length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 border-red-500/50 text-red-400 hover:bg-red-500/10"
                          onClick={() => setCustomDiceImages({})}
                        >
                          Clear All Custom Images
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Full Solfeggio Frequency Reference (Collapsible) */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6">
              <button
                onClick={() => setShowFrequencies(!showFrequencies)}
                className="w-full flex items-center justify-between text-left"
              >
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-blue-400" />
                  All 9 Solfeggio Frequencies + Healing Tones
                </h2>
                {showFrequencies ? <ChevronUp className="h-5 w-5 text-blue-400" /> : <ChevronDown className="h-5 w-5 text-blue-400" />}
              </button>

              {showFrequencies && (
                <div className="mt-6">
                  <p className="text-purple-300/80 text-sm mb-4">
                    The 9 sacred Solfeggio frequencies form the foundation of healing sound. Each carries unique vibrational energy. Tap any frequency to hear its tone.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ALL_FREQUENCIES.map((data) => (
                      <button
                        key={data.frequency}
                        onClick={() => { unlockAudio(); playFrequency(data.frequency); }}
                        onTouchEnd={(e) => { e.preventDefault(); unlockAudio(); playFrequency(data.frequency); }}
                        className={`bg-gradient-to-br ${data.bgColor} p-4 rounded-lg text-left hover:scale-105 transition-transform cursor-pointer border border-white/10 relative z-10 touch-manipulation`}
                        style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none' } as React.CSSProperties}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-bold text-lg">{data.note}</span>
                          <Volume2 className="h-4 w-4 text-white/60" />
                        </div>
                        <div className="text-white/90 text-xl font-bold">{data.frequency} Hz</div>
                        <div className="text-white/80 text-sm font-medium">{data.name}</div>
                        <div className="text-white/50 text-xs mt-1">{data.description}</div>
                      </button>
                    ))}
                  </div>

                  {/* Die-to-Frequency mapping */}
                  <div className="mt-6 bg-purple-900/30 rounded-lg p-4 border border-purple-500/20">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      Dice Face &rarr; Frequency Mapping
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(FREQUENCY_MAP).map(([key, data]) => (
                        <div key={key} className="flex items-center gap-2 bg-purple-900/40 rounded px-3 py-2">
                          <span className="text-yellow-400 font-bold">Die {key}</span>
                          <span className="text-white/50">=</span>
                          <span className={`${data.color} font-medium`}>{data.note} ({data.frequency} Hz)</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-purple-400/60 text-xs mt-3">
                      Frequency dice (red=2, purple=3, blue=4) earn double points when paired. The remaining 3 frequencies (741, 852, 963 Hz) are bonus tones unlocked through special rolls.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score Sheet */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Score Sheet
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {roundHistory.length === 0 ? (
                  <p className="text-purple-400/60 text-sm text-center py-4">Roll the dice to begin...</p>
                ) : (
                  roundHistory.map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-purple-900/30 rounded px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 font-mono text-xs">R{r.rollNumber}</span>
                        {players.length > 1 && <span className="text-purple-500 text-xs truncate max-w-[60px]">{r.player}</span>}
                        <span className="text-white">[{r.dice.join(', ')}]</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400/60 text-xs truncate max-w-[80px]">{r.score.label}</span>
                        <span className={`font-bold ${r.inTheNine ? 'text-yellow-400' : 'text-green-400'}`}>
                          +{r.score.points}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Leaderboard */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Swords className="h-5 w-5 text-purple-400" />
                Leaderboard
              </h2>
              {leaderboardQuery.data && leaderboardQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {leaderboardQuery.data.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-purple-900/30 rounded px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-purple-400'}`}>
                          #{i + 1}
                        </span>
                        <span className="text-white truncate max-w-[100px]">{entry.username || 'Player'}</span>
                      </div>
                      <span className="text-green-400 font-bold">{entry.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-purple-400/60 text-sm text-center py-4">No scores yet. Be the first!</p>
              )}
            </Card>

            {/* Downloads */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Download className="h-5 w-5 text-green-400" />
                Downloads
              </h2>
              <div className="space-y-3">
                <a href={PDFS.rulebook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg p-3 transition-colors no-underline">
                  <BookOpen className="h-5 w-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-medium">Official Rulebook</div>
                    <div className="text-purple-400/60 text-xs">Solbones 4+3+2 Dice Rulebook &amp; Cultural Guide</div>
                  </div>
                </a>
                <a href={PDFS.tournament} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg p-3 transition-colors no-underline">
                  <Trophy className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-medium">Tournament &amp; Score Sheets</div>
                    <div className="text-purple-400/60 text-xs">Printable brackets and scoring</div>
                  </div>
                </a>
                <a href={PDFS.youth} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg p-3 transition-colors no-underline">
                  <Sparkles className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-medium">Youth Scroll Challenges</div>
                    <div className="text-purple-400/60 text-xs">Zakar Games Legacy Activation Series</div>
                  </div>
                </a>
              </div>
            </Card>
          </div>
        </div>

        {/* Rules Section (Collapsible) */}
        <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6 mt-6">
          <button
            onClick={() => setShowRules(!showRules)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-400" />
              How to Play Solbones 4+3+2
            </h2>
            {showRules ? <ChevronUp className="h-5 w-5 text-purple-400" /> : <ChevronDown className="h-5 w-5 text-purple-400" />}
          </button>

          {showRules && (
            <div className="mt-6 space-y-6 text-purple-200">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Game Setup</h3>
                <p>You need 3 dice. Use white dice with yellow dots, or frequency dice: <span className="text-red-400 font-bold">red (2)</span>, <span className="text-purple-400 font-bold">purple (3)</span>, <span className="text-blue-400 font-bold">blue (4)</span>. Up to 9 players can join &mdash; the sacred number (4+3+2=9).</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Standard Game (First to 63)</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-yellow-400">{'\u25CF'}</span> Roll all 3 dice each round. Up to 3 rolls per round (4 if using a tally).</li>
                  <li className="flex gap-2"><span className="text-yellow-400">{'\u25CF'}</span> Score using pairs, frequency matches, or unique sequences.</li>
                  <li className="flex gap-2"><span className="text-yellow-400">{'\u25CF'}</span> <strong className="text-white">Tribing Up:</strong> 3 of a kind = 1 tally + score equals face value.</li>
                  <li className="flex gap-2"><span className="text-yellow-400">{'\u25CF'}</span> <strong className="text-white">Vibing Up:</strong> Score die is a frequency die (2, 3, or 4) = double score.</li>
                  <li className="flex gap-2"><span className="text-yellow-400">{'\u25CF'}</span> <strong className="text-white">In the Ether (4+3+2):</strong> 9 points + 1 tally.</li>
                  <li className="flex gap-2"><span className="text-yellow-400">{'\u25CF'}</span> <strong className="text-white">Zan Zone (4+3+2 in freq. colors):</strong> 18 points + 2 tallies.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Advanced: In the 9</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-blue-400">{'\u25CF'}</span> Same basic rules as standard.</li>
                  <li className="flex gap-2"><span className="text-blue-400">{'\u25CF'}</span> <strong className="text-white">Power Rule:</strong> If your dice total 9, you get +9 points and subtract 9 from the highest scorer.</li>
                  <li className="flex gap-2"><span className="text-blue-400">{'\u25CF'}</span> Using a tally with no score = lose 1 point.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Super Advanced: Spiral Up/Down</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-green-400">{'\u25CF'}</span> Game ends when a player reaches 36 (ascends) or 0 (resets).</li>
                  <li className="flex gap-2"><span className="text-green-400">{'\u25CF'}</span> Designed for high sacred time or divination-like game nights.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Multiplayer (Up to 9 Players)</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-purple-400">{'\u25CF'}</span> <strong className="text-white">Solo:</strong> Practice mode &mdash; play against yourself, track your score.</li>
                  <li className="flex gap-2"><span className="text-cyan-400">{'\u25CF'}</span> <strong className="text-white">QUMUS AI:</strong> Toggle any player slot to AI. QUMUS uses strategy to decide when to keep or re-roll.</li>
                  <li className="flex gap-2"><span className="text-green-400">{'\u25CF'}</span> <strong className="text-white">Local Multiplayer:</strong> Up to 9 players on one device &mdash; pass and play!</li>
                  <li className="flex gap-2"><span className="text-yellow-400">{'\u25CF'}</span> <strong className="text-white">Sacred 9:</strong> Fill all 9 slots for the ultimate game &mdash; mix humans and AI freely.</li>
                </ul>
              </div>

              <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-2">Cultural Use</h3>
                <p className="text-sm">Use at family gatherings, youth education circles, Shabbat game night. Earn tallies through acts of kindness, insight, and service. Elders may moderate or play. Encourages storytelling, sacred math, and emotional resilience.</p>
              </div>
            </div>
          )}
        </Card>

        {/* Youth Scroll Challenges (Collapsible) */}
        <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6 mt-6">
          <button
            onClick={() => setShowYouthChallenges(!showYouthChallenges)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Zakar Games &mdash; Youth Scroll Challenges
            </h2>
            {showYouthChallenges ? <ChevronUp className="h-5 w-5 text-blue-400" /> : <ChevronDown className="h-5 w-5 text-blue-400" />}
          </button>

          {showYouthChallenges && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { num: 1, title: 'Code Keeper', skill: 'Math + Sacred Frequency', task: 'Complete 3 games of Solbones 4+3+2 Dice with score sheet.', reflection: 'What number shows up most when I am in a good mood?', seal: 'Yellow Spiral', sealDesc: 'I know the numbers of my soul.', color: 'from-yellow-600 to-yellow-800' },
                { num: 2, title: 'Voice of the Tribe', skill: 'Speech + Confidence', task: 'Recite the Solbone Preamble to your family or class.', reflection: 'Which part made me feel powerful?', seal: 'Purple Flame', sealDesc: 'I speak the law of my people.', color: 'from-purple-600 to-purple-800' },
                { num: 3, title: "Healer's Hands", skill: 'Herbology + Compassion', task: 'Learn 3 local herbs and what they heal. Share with someone.', reflection: 'Who do I feel called to help right now?', seal: 'Green Leaf', sealDesc: 'I use my hands to restore.', color: 'from-green-600 to-green-800' },
                { num: 4, title: "Ancestor's Echo", skill: 'History + Legacy', task: 'Interview an elder or guardian. Write their story in your scroll.', reflection: 'What do I carry from them?', seal: 'Red Root', sealDesc: 'I remember who walked before me.', color: 'from-red-600 to-red-800' },
                { num: 5, title: 'Dream Scribe', skill: 'Intuition + Language', task: 'Record 3 dreams this month and draw a symbol for each.', reflection: 'What message came through while I slept?', seal: 'Blue Eye', sealDesc: 'I walk between the worlds.', color: 'from-blue-600 to-blue-800' },
              ].map((ch) => (
                <div key={ch.num} className={`bg-gradient-to-br ${ch.color} rounded-lg p-5 border border-white/10`}>
                  <div className="text-white/60 text-xs mb-1">Challenge {ch.num}</div>
                  <h3 className="text-white font-bold text-lg mb-1">{ch.title}</h3>
                  <div className="text-white/70 text-xs mb-3">{ch.skill}</div>
                  <p className="text-white/90 text-sm mb-2"><strong>Task:</strong> {ch.task}</p>
                  <p className="text-white/70 text-sm mb-3"><strong>Reflection:</strong> {ch.reflection}</p>
                  <div className="bg-black/20 rounded px-3 py-2">
                    <div className="text-yellow-300 text-xs font-bold">Seal Earned: {ch.seal}</div>
                    <div className="text-white/80 text-xs italic">{ch.sealDesc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-purple-400/50 text-sm">
          <p>This game belongs to the Solbone Nation, Amarukhan heritage, and all remnant people who walk in joy and intelligence.</p>
          <p className="mt-1">Laughing is healing. Numbers are sacred. We roll in code.</p>
          <p className="mt-2 text-purple-500/40">A Canryn Production</p>
        </div>
      </div>
    </div>
  );
}
