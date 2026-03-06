import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Star, Zap, Volume2, VolumeX, RotateCcw, ChevronRight, Lock, Award, Eye, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Frequency Match — Memory card matching game with Solfeggio frequency themes
// Match pairs of cards to progress through frequency levels

interface Card {
  id: number;
  symbol: string;
  label: string;
  matched: boolean;
  flipped: boolean;
}

interface Level {
  id: number;
  name: string;
  frequency: string;
  pairs: number;
  color: string;
  bgGradient: string;
  symbols: { symbol: string; label: string }[];
  timeLimit: number;
  unlocked: boolean;
}

const GAME_LEVELS: Level[] = [
  {
    id: 1, name: 'Root', frequency: '174 Hz', pairs: 6, color: '#e74c3c', bgGradient: 'from-red-900 to-red-700', timeLimit: 60, unlocked: true,
    symbols: [
      { symbol: '❤️', label: 'Love' }, { symbol: '🏠', label: 'Home' }, { symbol: '🌱', label: 'Growth' },
      { symbol: '🤝', label: 'Unity' }, { symbol: '🕊️', label: 'Peace' }, { symbol: '🌟', label: 'Hope' },
    ]
  },
  {
    id: 2, name: 'Sacral', frequency: '285 Hz', pairs: 8, color: '#e67e22', bgGradient: 'from-orange-900 to-orange-700', timeLimit: 75, unlocked: false,
    symbols: [
      { symbol: '🎵', label: 'Music' }, { symbol: '🎨', label: 'Art' }, { symbol: '💃', label: 'Dance' },
      { symbol: '🌊', label: 'Flow' }, { symbol: '🔥', label: 'Passion' }, { symbol: '🌺', label: 'Beauty' },
      { symbol: '🎭', label: 'Expression' }, { symbol: '✨', label: 'Create' },
    ]
  },
  {
    id: 3, name: 'Solar Plexus', frequency: '396 Hz', pairs: 8, color: '#f1c40f', bgGradient: 'from-yellow-900 to-yellow-700', timeLimit: 65, unlocked: false,
    symbols: [
      { symbol: '👑', label: 'Crown' }, { symbol: '💪', label: 'Strength' }, { symbol: '🦁', label: 'Courage' },
      { symbol: '⚡', label: 'Power' }, { symbol: '🏆', label: 'Victory' }, { symbol: '🌞', label: 'Radiance' },
      { symbol: '🛡️', label: 'Shield' }, { symbol: '🗡️', label: 'Justice' },
    ]
  },
  {
    id: 4, name: 'Heart', frequency: '432 Hz', pairs: 10, color: '#2ecc71', bgGradient: 'from-green-900 to-green-700', timeLimit: 80, unlocked: false,
    symbols: [
      { symbol: '💚', label: 'Heal' }, { symbol: '🌿', label: 'Nature' }, { symbol: '🕊️', label: 'Peace' },
      { symbol: '🤗', label: 'Embrace' }, { symbol: '🌈', label: 'Promise' }, { symbol: '🙏', label: 'Prayer' },
      { symbol: '💐', label: 'Bloom' }, { symbol: '🦋', label: 'Transform' }, { symbol: '🌻', label: 'Joy' },
      { symbol: '🕯️', label: 'Light' },
    ]
  },
  {
    id: 5, name: 'Throat', frequency: '528 Hz', pairs: 10, color: '#3498db', bgGradient: 'from-blue-900 to-blue-700', timeLimit: 70, unlocked: false,
    symbols: [
      { symbol: '🎤', label: 'Voice' }, { symbol: '📢', label: 'Speak' }, { symbol: '📖', label: 'Story' },
      { symbol: '✍️', label: 'Write' }, { symbol: '🎶', label: 'Sing' }, { symbol: '📻', label: 'Broadcast' },
      { symbol: '🌍', label: 'World' }, { symbol: '💬', label: 'Connect' }, { symbol: '📡', label: 'Signal' },
      { symbol: '🔔', label: 'Announce' },
    ]
  },
  {
    id: 6, name: 'Third Eye', frequency: '639 Hz', pairs: 12, color: '#9b59b6', bgGradient: 'from-purple-900 to-purple-700', timeLimit: 75, unlocked: false,
    symbols: [
      { symbol: '👁️', label: 'Vision' }, { symbol: '🔮', label: 'Insight' }, { symbol: '🌙', label: 'Intuition' },
      { symbol: '⭐', label: 'Destiny' }, { symbol: '🧠', label: 'Wisdom' }, { symbol: '🔭', label: 'Foresight' },
      { symbol: '💎', label: 'Clarity' }, { symbol: '🌌', label: 'Cosmos' }, { symbol: '🧿', label: 'Protect' },
      { symbol: '🪬', label: 'Guide' }, { symbol: '🦅', label: 'Soar' }, { symbol: '🏛️', label: 'Legacy' },
    ]
  },
  {
    id: 7, name: 'Crown', frequency: '741 Hz', pairs: 12, color: '#1abc9c', bgGradient: 'from-teal-900 to-teal-700', timeLimit: 65, unlocked: false,
    symbols: [
      { symbol: '🕉️', label: 'Spirit' }, { symbol: '☀️', label: 'Divine' }, { symbol: '🌀', label: 'Infinite' },
      { symbol: '🪷', label: 'Lotus' }, { symbol: '🌠', label: 'Ascend' }, { symbol: '💫', label: 'Miracle' },
      { symbol: '🔱', label: 'Trident' }, { symbol: '🏔️', label: 'Summit' }, { symbol: '🌅', label: 'Dawn' },
      { symbol: '🎆', label: 'Celebrate' }, { symbol: '🦢', label: 'Grace' }, { symbol: '🌳', label: 'Roots' },
    ]
  },
];

const POWER_UPS = [
  { id: 'peek', name: 'Peek', icon: <Eye size={16} />, description: 'Reveal all cards for 2 seconds', cost: 0, uses: 1 },
  { id: 'freeze', name: 'Freeze Time', icon: <Clock size={16} />, description: 'Pause timer for 10 seconds', cost: 0, uses: 1 },
  { id: 'hint', name: 'Hint', icon: <Sparkles size={16} />, description: 'Highlight one matching pair', cost: 0, uses: 2 },
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FrequencyMatchGame() {
  const [levels, setLevels] = useState<Level[]>(() => {
    const saved = localStorage.getItem('fm_levels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return GAME_LEVELS.map((l, i) => ({ ...l, unlocked: parsed[i]?.unlocked ?? l.unlocked }));
      } catch { return GAME_LEVELS; }
    }
    return GAME_LEVELS;
  });

  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [powerUps, setPowerUps] = useState<{ [key: string]: number }>({});
  const [frozen, setFrozen] = useState(false);
  const [totalScore, setTotalScore] = useState(() => {
    const s = localStorage.getItem('fm_total_score');
    return s ? parseInt(s) : 0;
  });
  const [highestLevel, setHighestLevel] = useState(() => {
    const s = localStorage.getItem('fm_highest_level');
    return s ? parseInt(s) : 1;
  });
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => { localStorage.setItem('fm_levels', JSON.stringify(levels)); }, [levels]);
  useEffect(() => { localStorage.setItem('fm_total_score', totalScore.toString()); }, [totalScore]);
  useEffect(() => { localStorage.setItem('fm_highest_level', highestLevel.toString()); }, [highestLevel]);

  useEffect(() => {
    if (gameActive && timeLeft > 0 && !frozen) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timerRef.current);
    }
    if (timeLeft === 0 && gameActive) endRound(false);
  }, [gameActive, timeLeft, frozen]);

  const playSound = useCallback((type: 'flip' | 'match' | 'wrong' | 'win' | 'powerup') => {
    if (!soundOn) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.12;
      const freqs: Record<string, number> = { flip: 440, match: 528, wrong: 200, win: 639, powerup: 741 };
      osc.frequency.value = freqs[type] || 440;
      osc.type = type === 'match' ? 'sine' : type === 'wrong' ? 'sawtooth' : 'triangle';
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (type === 'win' ? 0.5 : 0.2));
      osc.start();
      osc.stop(ctx.currentTime + (type === 'win' ? 0.5 : 0.2));
    } catch {}
  }, [soundOn]);

  const startLevel = (levelIdx: number) => {
    const level = levels[levelIdx];
    if (!level?.unlocked) return;
    const symbols = level.symbols.slice(0, level.pairs);
    const cardPairs = symbols.flatMap((s, i) => [
      { id: i * 2, symbol: s.symbol, label: s.label, matched: false, flipped: false },
      { id: i * 2 + 1, symbol: s.symbol, label: s.label, matched: false, flipped: false },
    ]);
    setCards(shuffleArray(cardPairs));
    setFlippedIds([]);
    setMatchedPairs(0);
    setMoves(0);
    setScore(0);
    setCombo(0);
    setTimeLeft(level.timeLimit);
    setCurrentLevel(levelIdx);
    setGameActive(true);
    setShowLevelSelect(false);
    setFrozen(false);
    setPowerUps({ peek: 1, freeze: 1, hint: 2 });
  };

  const endRound = (won: boolean) => {
    setGameActive(false);
    clearInterval(timerRef.current);
    if (won) {
      const timeBonus = timeLeft * 10;
      const moveBonus = Math.max(0, 500 - moves * 10);
      const finalScore = score + timeBonus + moveBonus;
      setScore(finalScore);
      setTotalScore(t => t + finalScore);
      playSound('win');

      if (currentLevel !== null && currentLevel < levels.length - 1) {
        const newLevels = [...levels];
        newLevels[currentLevel + 1] = { ...newLevels[currentLevel + 1], unlocked: true };
        setLevels(newLevels);
        const newHighest = Math.max(highestLevel, currentLevel + 2);
        setHighestLevel(newHighest);
        toast.success(`Level ${currentLevel + 2} Unlocked! 🎉`);
      }
    }
  };

  const handleCardClick = (cardId: number) => {
    if (!gameActive || flippedIds.length >= 2) return;
    const card = cards.find(c => c.id === cardId);
    if (!card || card.matched || flippedIds.includes(cardId)) return;

    playSound('flip');
    const newFlipped = [...flippedIds, cardId];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id)!);
      if (first.symbol === second.symbol) {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.symbol === first.symbol ? { ...c, matched: true } : c));
          setMatchedPairs(p => {
            const newPairs = p + 1;
            const level = levels[currentLevel!];
            if (newPairs === level.pairs) setTimeout(() => endRound(true), 300);
            return newPairs;
          });
          setCombo(c => c + 1);
          setScore(s => s + 100 * (1 + combo * 0.25));
          setFlippedIds([]);
          playSound('match');
        }, 400);
      } else {
        setCombo(0);
        setTimeout(() => {
          setFlippedIds([]);
          playSound('wrong');
        }, 800);
      }
    }
  };

  const usePowerUp = (id: string) => {
    if (!gameActive || !powerUps[id] || powerUps[id] <= 0) return;
    setPowerUps(p => ({ ...p, [id]: p[id] - 1 }));
    playSound('powerup');

    if (id === 'peek') {
      setCards(prev => prev.map(c => ({ ...c, flipped: true })));
      setTimeout(() => setCards(prev => prev.map(c => c.matched ? c : { ...c, flipped: false })), 2000);
    } else if (id === 'freeze') {
      setFrozen(true);
      toast.info('⏸️ Timer frozen for 10 seconds!');
      setTimeout(() => setFrozen(false), 10000);
    } else if (id === 'hint') {
      const unmatched = cards.filter(c => !c.matched);
      if (unmatched.length >= 2) {
        const target = unmatched[0];
        const pair = unmatched.find(c => c.symbol === target.symbol && c.id !== target.id);
        if (pair) {
          setCards(prev => prev.map(c => (c.id === target.id || c.id === pair.id) ? { ...c, flipped: true } : c));
          setTimeout(() => setCards(prev => prev.map(c => c.matched ? c : { ...c, flipped: false })), 1500);
        }
      }
    }
  };

  if (showLevelSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300">
              <ArrowLeft size={20} /> Home
            </Link>
            <button onClick={() => setSoundOn(!soundOn)} className="text-gray-400 hover:text-white" aria-label={soundOn ? 'Mute' : 'Unmute'}>
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-2">Frequency Match</h1>
            <p className="text-gray-400">Match pairs to unlock higher frequencies of consciousness</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span className="text-yellow-400"><Trophy size={14} className="inline mr-1" />{totalScore} pts</span>
              <span className="text-green-400"><Zap size={14} className="inline mr-1" />Level {highestLevel}</span>
            </div>
          </div>

          <div className="grid gap-3" role="list" aria-label="Game levels">
            {levels.map((level, i) => (
              <button
                key={level.id}
                onClick={() => level.unlocked && startLevel(i)}
                disabled={!level.unlocked}
                className={`p-4 rounded-xl border text-left transition-all ${level.unlocked ? `bg-gradient-to-r ${level.bgGradient} border-white/20 hover:scale-[1.02] cursor-pointer` : 'bg-gray-800/50 border-gray-700 cursor-not-allowed'}`}
                role="listitem"
                aria-label={`Level ${level.id}: ${level.name} - ${level.frequency} - ${level.pairs} pairs${level.unlocked ? '' : ' - Locked'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {level.unlocked ? <Star size={20} style={{ color: level.color }} /> : <Lock size={20} className="text-gray-500" />}
                    <div>
                      <p className="font-bold text-lg">{level.name}</p>
                      <p className="text-sm opacity-70">{level.frequency} • {level.pairs} pairs • {level.timeLimit}s</p>
                    </div>
                  </div>
                  {level.unlocked ? <ChevronRight size={20} /> : <Lock size={16} className="text-gray-500" />}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 text-center flex gap-4 justify-center">
            <Link href="/games/word-frequency" className="text-yellow-400 hover:text-yellow-300 text-sm">Play Word Frequency →</Link>
            <Link href="/solbones" className="text-yellow-400 hover:text-yellow-300 text-sm">Play Solbones →</Link>
          </div>
        </div>
      </div>
    );
  }

  const level = currentLevel !== null ? levels[currentLevel] : null;
  const cols = level ? (level.pairs <= 6 ? 4 : level.pairs <= 8 ? 4 : 5) : 4;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${level?.bgGradient || 'from-gray-900 to-gray-800'} text-white p-2 sm:p-4`}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => { setGameActive(false); clearInterval(timerRef.current); setShowLevelSelect(true); }} className="text-yellow-400" aria-label="Back to levels">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-xs opacity-70">{level?.name} • {level?.frequency}</p>
            <p className="font-bold text-yellow-400">{Math.round(score)} pts</p>
          </div>
          <div className="flex items-center gap-2">
            {combo > 1 && <span className="text-orange-400 text-sm font-bold">🔥{combo}x</span>}
            <span className="text-xs text-gray-400">{moves} moves</span>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>{matchedPairs}/{level?.pairs} pairs</span>
            <span className={`${frozen ? 'text-blue-400' : timeLeft <= 10 ? 'text-red-400 animate-pulse' : ''}`}>
              {frozen ? '❄️ ' : ''}{timeLeft}s
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${frozen ? 'bg-blue-400' : 'bg-gradient-to-r from-purple-400 to-pink-500'}`} style={{ width: `${level ? (timeLeft / level.timeLimit) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Power-ups */}
        {gameActive && (
          <div className="flex gap-2 mb-3 justify-center">
            {POWER_UPS.map(pu => (
              <button
                key={pu.id}
                onClick={() => usePowerUp(pu.id)}
                disabled={!powerUps[pu.id] || powerUps[pu.id] <= 0}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs ${powerUps[pu.id] > 0 ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                aria-label={`${pu.name}: ${pu.description}. ${powerUps[pu.id] || 0} uses remaining`}
              >
                {pu.icon} {pu.name} ({powerUps[pu.id] || 0})
              </button>
            ))}
          </div>
        )}

        {/* Card Grid */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} role="grid" aria-label="Memory card grid">
          {cards.map(card => {
            const isFlipped = card.matched || card.flipped || flippedIds.includes(card.id);
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square rounded-xl text-2xl sm:text-3xl flex flex-col items-center justify-center transition-all duration-300 ${card.matched ? 'bg-green-600/40 scale-95 opacity-60' : isFlipped ? 'bg-white/20 scale-105 border-2 border-white/40' : 'bg-white/10 hover:bg-white/15 cursor-pointer border border-white/10'}`}
                disabled={card.matched || !gameActive}
                role="gridcell"
                aria-label={isFlipped ? `${card.label}${card.matched ? ' (matched)' : ''}` : 'Hidden card'}
              >
                {isFlipped ? (
                  <>
                    <span>{card.symbol}</span>
                    <span className="text-[8px] sm:text-[10px] opacity-60 mt-1">{card.label}</span>
                  </>
                ) : (
                  <span className="text-lg opacity-30">?</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Game Over */}
        {!gameActive && currentLevel !== null && (
          <div className="mt-4 bg-black/60 backdrop-blur rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{matchedPairs === level?.pairs ? '🎉 Perfect Match!' : '⏰ Time\'s Up!'}</h2>
            <p className="text-yellow-400 text-xl mb-1">{Math.round(score)} points</p>
            <p className="text-sm text-gray-400 mb-4">{matchedPairs}/{level?.pairs} pairs in {moves} moves</p>
            {matchedPairs === level?.pairs && currentLevel < levels.length - 1 && (
              <p className="text-green-400 mb-4">Next level unlocked! 🔓</p>
            )}
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => startLevel(currentLevel)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center gap-2">
                <RotateCcw size={16} /> Replay
              </button>
              {matchedPairs === level?.pairs && currentLevel < levels.length - 1 && (
                <button onClick={() => startLevel(currentLevel + 1)} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg flex items-center gap-2">
                  Next Level <ChevronRight size={16} />
                </button>
              )}
              <button onClick={() => setShowLevelSelect(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                Levels
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
